package project.TeamFive.ExLMS.meeting.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.meeting.dto.request.CreateMeetingRequest;
import project.TeamFive.ExLMS.meeting.dto.response.MeetingResponseDTO;
import project.TeamFive.ExLMS.meeting.entity.Meeting;
import project.TeamFive.ExLMS.meeting.repository.MeetingRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.meeting.dto.request.CreatePollRequest;
import project.TeamFive.ExLMS.meeting.dto.request.QuestionRequest;
import project.TeamFive.ExLMS.meeting.dto.response.*;
import project.TeamFive.ExLMS.meeting.entity.*;
import project.TeamFive.ExLMS.meeting.repository.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final MeetingAttendanceRepository attendanceRepository;
    private final MeetingQuestionRepository questionRepository;
    private final MeetingPollRepository pollRepository;
    private final MeetingPollOptionRepository pollOptionRepository;
    private final MeetingPollVoteRepository pollVoteRepository;

    private void requireInstructorRole(StudyGroup group, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException(
                    "Truy cập bị từ chối: Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền quản lý Buổi học trực tuyến!");
        }
    }

    @Transactional
    public MeetingResponseDTO scheduleMeeting(UUID groupId, CreateMeetingRequest request, User creator) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Study Group not found"));

        requireInstructorRole(group, creator);

        String roomName = group.getName().replaceAll("\\s+", "-") + "-" + UUID.randomUUID().toString().substring(0, 8);
        String jitsiUrl = "https://meet.jit.si/" + roomName;

        Meeting meeting = Meeting.builder()
                .group(group)
                .createdBy(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .meetingType(request.getMeetingType())
                .platform("jitsi")
                .joinUrl(jitsiUrl)
                .startAt(request.getStartAt() != null ? request.getStartAt() : LocalDateTime.now())
                .durationMinutes(request.getDurationMinutes())
                .status(Meeting.MeetingStatus.SCHEDULED)
                .build();

        meeting = meetingRepository.save(meeting);

        // Integrate with Calendar for all group members
        List<GroupMember> members = groupMemberRepository.findByGroup_Id(groupId);
        for (GroupMember m : members) {
            CalendarEvent event = CalendarEvent.builder()
                    .user(m.getUser())
                    .title("Meeting: " + meeting.getTitle())
                    .description(meeting.getDescription())
                    .startAt(meeting.getStartAt())
                    .endAt(meeting.getStartAt().plusMinutes(meeting.getDurationMinutes()))
                    .eventType(CalendarEvent.EventType.MEETING)
                    .sourceEntityId(meeting.getId())
                    .sourceEntityType(CalendarEvent.SourceEntityType.MEETING)
                    .color("#6366F1")
                    .build();
            calendarEventRepository.save(event);
        }

        return MeetingResponseDTO.fromEntity(meeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponseDTO> getMeetingsByGroup(UUID groupId) {
        return meetingRepository.findByGroup_IdOrderByStartAtDesc(groupId).stream()
                .map(MeetingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingResponseDTO updateMeeting(UUID id, CreateMeetingRequest request, User instructor) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (meeting.getStatus() != Meeting.MeetingStatus.SCHEDULED) {
            throw new RuntimeException("Chỉ có thể chỉnh sửa buổi họp khi đang ở trạng thái 'Đã lên lịch'");
        }

        requireInstructorRole(meeting.getGroup(), instructor);

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingType(request.getMeetingType());
        meeting.setStartAt(request.getStartAt());
        meeting.setDurationMinutes(request.getDurationMinutes());

        // Update calendar events for all members
        List<CalendarEvent> events = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(id, CalendarEvent.SourceEntityType.MEETING);
        for (CalendarEvent event : events) {
            event.setTitle("Meeting: " + meeting.getTitle());
            event.setDescription(meeting.getDescription());
            event.setStartAt(meeting.getStartAt());
            event.setEndAt(meeting.getStartAt().plusMinutes(meeting.getDurationMinutes()));
            calendarEventRepository.save(event);
        }

        return MeetingResponseDTO.fromEntity(meetingRepository.save(meeting));
    }

    @Transactional
    public void deleteMeeting(UUID id, User instructor) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (meeting.getStatus() == Meeting.MeetingStatus.LIVE) {
            throw new RuntimeException("Không thể xóa buổi họp khi đang diễn ra!");
        }

        requireInstructorRole(meeting.getGroup(), instructor);

        // Delete associated calendar events
        List<CalendarEvent> events = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(id, CalendarEvent.SourceEntityType.MEETING);
        calendarEventRepository.deleteAll(events);

        // Delete other associated data (attendance, questions, polls etc would be cascade or manual)
        // For simplicity, we assume cascading or we delete them here if needed
        meetingRepository.delete(meeting);
    }

    @Transactional
    public void startMeeting(UUID id, User instructor) {
        Meeting meeting = meetingRepository.findById(id).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);

        if (meeting.getStatus() != Meeting.MeetingStatus.SCHEDULED) {
            throw new RuntimeException("Buổi họp đã bắt đầu hoặc đã kết thúc.");
        }

        // Allow starting 15 minutes early or anytime during
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(meeting.getStartAt().minusMinutes(15))) {
            throw new RuntimeException("Không thể bắt đầu buổi họp quá sớm. Vui lòng quay lại trước giờ bắt đầu 15 phút.");
        }

        meeting.setStatus(Meeting.MeetingStatus.LIVE);
        meetingRepository.save(meeting);
    }

    @Transactional
    public void endMeeting(UUID id, User instructor) {
        Meeting meeting = meetingRepository.findById(id).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);
        meeting.setStatus(Meeting.MeetingStatus.ENDED);
        meetingRepository.save(meeting);
    }

    @Transactional
    public void recordAttendance(UUID meetingId, User user, boolean joining) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        
        MeetingAttendance attendance = attendanceRepository.findByMeeting_IdAndUser_Id(meetingId, user.getId())
                .orElse(MeetingAttendance.builder()
                        .meeting(meeting)
                        .user(user)
                        .present(true)
                        .durationSec(0)
                        .build());

        if (joining) {
            attendance.setJoinedAt(LocalDateTime.now());
        } else {
            attendance.setLeftAt(LocalDateTime.now());
            if (attendance.getJoinedAt() != null) {
                long seconds = Duration.between(attendance.getJoinedAt(), attendance.getLeftAt()).getSeconds();
                attendance.setDurationSec(attendance.getDurationSec() + (int) seconds);
            }
        }
        attendanceRepository.save(attendance);
    }

    @Transactional
    public QuestionResponseDTO addQuestion(UUID meetingId, QuestionRequest request, User user) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        MeetingQuestion question = MeetingQuestion.builder()
                .meeting(meeting)
                .user(user)
                .content(request.getContent())
                .isPrivate(request.isPrivate())
                .answered(false)
                .build();
        return mapToQuestionDTO(questionRepository.save(question));
    }

    @Transactional
    public void answerQuestion(UUID questionId, String answer, User instructor) {
        MeetingQuestion question = questionRepository.findById(questionId).orElseThrow();
        requireInstructorRole(question.getMeeting().getGroup(), instructor);
        question.setAnswer(answer);
        question.setAnsweredBy(instructor);
        question.setAnswered(true);
        questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getQuestions(UUID meetingId) {
        return questionRepository.findByMeeting_IdOrderByCreatedAtAsc(meetingId).stream()
                .map(this::mapToQuestionDTO).collect(Collectors.toList());
    }

    @Transactional
    public PollResponseDTO createPoll(UUID meetingId, CreatePollRequest request, User instructor) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);

        MeetingPoll poll = MeetingPoll.builder()
                .meeting(meeting)
                .question(request.getQuestion())
                .active(true)
                .build();
        poll = pollRepository.save(poll);

        for (String label : request.getOptions()) {
            MeetingPollOption opt = MeetingPollOption.builder()
                    .poll(poll)
                    .label(label)
                    .voteCount(0)
                    .build();
            pollOptionRepository.save(opt);
        }
        return getPollDetailed(poll.getId(), null);
    }

    @Transactional
    public void voteInPoll(UUID pollId, UUID optionId, User user) {
        MeetingPoll poll = pollRepository.findById(pollId).orElseThrow();
        MeetingPollOption option = pollOptionRepository.findById(optionId).orElseThrow();

        MeetingPollVote.MeetingPollVoteId voteId = new MeetingPollVote.MeetingPollVoteId(pollId, user.getId());
        if (pollVoteRepository.existsById(voteId)) {
            throw new RuntimeException("You have already voted in this poll");
        }

        MeetingPollVote vote = MeetingPollVote.builder()
                .id(voteId)
                .poll(poll)
                .user(user)
                .option(option)
                .build();
        pollVoteRepository.save(vote);

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);
    }

    @Transactional(readOnly = true)
    public List<PollResponseDTO> getPolls(UUID meetingId, User user) {
        return pollRepository.findByMeeting_Id(meetingId).stream()
                .map(p -> getPollDetailed(p.getId(), user.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingAttendanceResponseDTO> getAttendanceReport(UUID meetingId, User instructor) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);
        return attendanceRepository.findByMeeting_Id(meetingId).stream()
                .map(a -> MeetingAttendanceResponseDTO.builder()
                        .id(a.getId())
                        .userId(a.getUser().getId())
                        .userName(a.getUser().getFullName())
                        .joinedAt(a.getJoinedAt())
                        .leftAt(a.getLeftAt())
                        .durationSec(a.getDurationSec())
                        .isPresent(a.isPresent())
                        .build())
                .collect(Collectors.toList());
    }

    private QuestionResponseDTO mapToQuestionDTO(MeetingQuestion q) {
        return QuestionResponseDTO.builder()
                .id(q.getId())
                .userId(q.getUser().getId())
                .userName(q.getUser().getFullName())
                .content(q.getContent())
                .answer(q.getAnswer())
                .answeredByName(q.getAnsweredBy() != null ? q.getAnsweredBy().getFullName() : null)
                .answered(q.isAnswered())
                .isPrivate(q.isPrivate())
                .createdAt(q.getCreatedAt())
                .build();
    }

    private PollResponseDTO getPollDetailed(UUID pollId, UUID userId) {
        MeetingPoll poll = pollRepository.findById(pollId).orElseThrow();
        UUID votedOptionId = null;
        if (userId != null) {
            votedOptionId = pollVoteRepository.findById(new MeetingPollVote.MeetingPollVoteId(pollId, userId))
                    .map(v -> v.getOption().getId()).orElse(null);
        }

        return PollResponseDTO.builder()
                .id(poll.getId())
                .question(poll.getQuestion())
                .active(poll.isActive())
                .userVotedOptionId(votedOptionId)
                .options(poll.getOptions().stream()
                        .map(o -> PollResponseDTO.OptionDTO.builder()
                                .id(o.getId())
                                .label(o.getLabel())
                                .voteCount(o.getVoteCount())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public MeetingResponseDTO getMeetingById(UUID id, User user) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        MeetingResponseDTO dto = MeetingResponseDTO.fromEntity(meeting);
        
        // Find user's role in this group
        groupMemberRepository.findByGroup_IdAndUser_Id(meeting.getGroup().getId(), user.getId())
                .ifPresent(member -> dto.setCurrentUserRole(member.getRole()));
                
        return dto;
    }
}
