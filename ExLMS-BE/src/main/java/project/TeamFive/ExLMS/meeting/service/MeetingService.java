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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final StudyGroupRepository studyGroupRepository;

    @Transactional
    public MeetingResponseDTO scheduleMeeting(UUID groupId, CreateMeetingRequest request, User creator) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Study Group not found"));

        // Generate Jitsi Meeting URL
        // Format: https://meet.jit.si/[group-name]-[random-uuid]
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
                .startAt(request.getStartAt())
                .durationMinutes(request.getDurationMinutes())
                .status(Meeting.MeetingStatus.SCHEDULED)
                .build();

        return MeetingResponseDTO.fromEntity(meetingRepository.save(meeting));
    }

    public MeetingResponseDTO getMeetingById(UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return MeetingResponseDTO.fromEntity(meeting);
    }
}
