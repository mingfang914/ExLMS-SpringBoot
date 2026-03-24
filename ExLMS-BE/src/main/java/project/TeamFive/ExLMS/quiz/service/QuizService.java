package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.request.QuizAttemptRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.dto.response.QuizAttemptResponse;
import project.TeamFive.ExLMS.quiz.dto.response.QuizStatsResponse;
import project.TeamFive.ExLMS.quiz.entity.*;
import project.TeamFive.ExLMS.quiz.repository.*;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizResponseRepository responseRepository;

    private void requireInstructorRole(StudyGroup group, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException(
                    "Truy cập bị từ chối: Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền tạo Bài kiểm tra!");
        }
    }

    @Transactional
    public QuizResponseDTO createQuiz(UUID courseId, CreateQuizRequest request, User creator) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        requireInstructorRole(course.getGroup(), creator);

        Quiz quiz = Quiz.builder()
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimitSec(request.getTimeLimitSec())
                .maxAttempts(request.getMaxAttempts())
                .passingScore(request.getPassingScore())
                .shuffleQuestions(request.isShuffleQuestions())
                .resultVisibility(request.getResultVisibility())
                .createdBy(creator)
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                var qReq = request.getQuestions().get(i);
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(savedQuiz)
                        .content(qReq.getContent())
                        .questionType(QuizQuestion.QuestionType.valueOf(qReq.getQuestionType()))
                        .points(qReq.getPoints())
                        .explanation(qReq.getExplanation())
                        .orderIndex(i)
                        .build();
                QuizQuestion savedQuestion = questionRepository.save(question);

                if (qReq.getAnswers() != null) {
                    for (int j = 0; j < qReq.getAnswers().size(); j++) {
                        var aReq = qReq.getAnswers().get(j);
                        QuizAnswer answer = QuizAnswer.builder()
                                .question(savedQuestion)
                                .content(aReq.getContent())
                                .correct(aReq.isCorrect())
                                .orderIndex(j)
                                .build();
                        answerRepository.save(answer);
                    }
                }
            }
        }

        return getQuizById(savedQuiz.getId());
    }

    @Transactional
    public QuizResponseDTO updateQuiz(UUID id, CreateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTimeLimitSec(request.getTimeLimitSec());
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setShuffleQuestions(request.isShuffleQuestions());
        quiz.setResultVisibility(request.getResultVisibility());

        quizRepository.save(quiz);

        List<QuizQuestion> oldQuestions = questionRepository.findByQuizIdOrderByOrderIndexAsc(id);
        for (QuizQuestion q : oldQuestions) {
            answerRepository.deleteAll(answerRepository.findByQuestionIdOrderByOrderIndexAsc(q.getId()));
        }
        questionRepository.deleteAll(oldQuestions);

        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                var qReq = request.getQuestions().get(i);
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .content(qReq.getContent())
                        .questionType(QuizQuestion.QuestionType.valueOf(qReq.getQuestionType()))
                        .points(qReq.getPoints())
                        .explanation(qReq.getExplanation())
                        .orderIndex(i)
                        .build();
                QuizQuestion savedQuestion = questionRepository.save(question);

                if (qReq.getAnswers() != null) {
                    for (int j = 0; j < qReq.getAnswers().size(); j++) {
                        var aReq = qReq.getAnswers().get(j);
                        QuizAnswer answer = QuizAnswer.builder()
                                .question(savedQuestion)
                                .content(aReq.getContent())
                                .correct(aReq.isCorrect())
                                .orderIndex(j)
                                .build();
                        answerRepository.save(answer);
                    }
                }
            }
        }

        return getQuizById(quiz.getId());
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDTO> getQuizzesByCourseId(UUID courseId) {
        List<Quiz> quizzes = quizRepository.findByCourse_Id(courseId);
        return quizzes.stream().map(q -> QuizResponseDTO.builder()
                .id(q.getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .timeLimitSec(q.getTimeLimitSec())
                .maxAttempts(q.getMaxAttempts())
                .passingScore(q.getPassingScore())
                .shuffleQuestions(q.isShuffleQuestions())
                .resultVisibility(q.getResultVisibility())
                .chapterId(q.getChapter() != null ? q.getChapter().getId() : null)
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponseDTO getQuizById(UUID id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(id);

        return QuizResponseDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitSec(quiz.getTimeLimitSec())
                .maxAttempts(quiz.getMaxAttempts())
                .passingScore(quiz.getPassingScore())
                .shuffleQuestions(quiz.isShuffleQuestions())
                .resultVisibility(quiz.getResultVisibility())
                .questions(questions.stream().map(q -> {
                    List<QuizAnswer> answers = answerRepository.findByQuestionIdOrderByOrderIndexAsc(q.getId());
                    return QuizResponseDTO.QuestionResponse.builder()
                            .id(q.getId())
                            .content(q.getContent())
                            .questionType(q.getQuestionType().name())
                            .points(q.getPoints())
                            .explanation(q.getExplanation())
                            .answers(answers.stream().map(a -> QuizResponseDTO.AnswerResponse.builder()
                                    .id(a.getId())
                                    .content(a.getContent())
                                    .correct(a.isCorrect())
                                    .build()).collect(Collectors.toList()))
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public QuizAttemptResponse startAttempt(UUID quizId, User student) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // 1. Kiểm tra xem có lần làm bài nào đang dở (chưa nộp) không?
        // Nếu có, trả về lần đó luôn để tiếp tục làm thay vì tạo mới.
        Optional<QuizAttempt> existingIncomplete = attemptRepository
                .findTopByQuiz_IdAndUser_IdOrderByAttemptNumberDesc(quizId, student.getId())
                .filter(a -> a.getSubmittedAt() == null);

        if (existingIncomplete.isPresent()) {
            QuizAttempt a = existingIncomplete.get();
            return QuizAttemptResponse.builder()
                    .id(a.getId())
                    .quizId(quizId)
                    .startedAt(a.getStartedAt())
                    .attemptNumber(a.getAttemptNumber())
                    .passingScore(quiz.getPassingScore())
                    .build();
        }

        // 2. Kiểm tra giới hạn số lần làm (chỉ tính lần đã nộp)
        long submittedCount = attemptRepository.countByQuiz_IdAndUser_IdAndSubmittedAtIsNotNull(quizId, student.getId());
        if (submittedCount >= quiz.getMaxAttempts()) {
            throw new RuntimeException("Bạn đã hết lượt làm bài cho bài kiểm tra này!");
        }

        // 3. Tạo lần làm mới
        long totalCount = attemptRepository.countByQuiz_IdAndUser_Id(quizId, student.getId());
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(student)
                .attemptNumber((int) (totalCount + 1))
                .startedAt(LocalDateTime.now())
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        return QuizAttemptResponse.builder()
                .id(savedAttempt.getId())
                .quizId(quizId)
                .startedAt(savedAttempt.getStartedAt())
                .attemptNumber(savedAttempt.getAttemptNumber())
                .passingScore(quiz.getPassingScore())
                .build();
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(UUID attemptId, QuizAttemptRequest submission) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException("Bài kiểm tra này đã được nộp!");
        }

        Quiz quiz = attempt.getQuiz();
        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quiz.getId());
        int totalPointsEarned = 0;
        int maxPossiblePoints = 0;

        for (QuizQuestion question : questions) {
            maxPossiblePoints += question.getPoints();
            
            var studentAns = submission.getAnswers().stream()
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            QuizResponse response = QuizResponse.builder()
                    .attempt(attempt)
                    .question(question)
                    .pointsEarned(0)
                    .build();

            if (studentAns != null) {
                switch (question.getQuestionType()) {
                    case SINGLE_CHOICE:
                    case TRUE_FALSE:
                        if (studentAns.getSelectedAnswerId() != null) {
                            QuizAnswer ans = answerRepository.findById(studentAns.getSelectedAnswerId()).orElse(null);
                            response.setSelectedAnswer(ans);
                            if (ans != null && ans.isCorrect()) {
                                response.setCorrect(true);
                                response.setPointsEarned(question.getPoints());
                            } else {
                                response.setCorrect(false);
                            }
                        }
                        break;
                    case MULTIPLE_CHOICE:
                        if (studentAns.getSelectedAnswerIds() != null && !studentAns.getSelectedAnswerIds().isEmpty()) {
                            // Lấy tất cả các đáp án của câu hỏi này để map tên cho các ID đã chọn
                            List<QuizAnswer> allAnswers = answerRepository.findByQuestionIdOrderByOrderIndexAsc(question.getId());
                            List<UUID> studentIds = studentAns.getSelectedAnswerIds();

                            String selectedText = allAnswers.stream()
                                    .filter(a -> studentIds.contains(a.getId()))
                                    .map(QuizAnswer::getContent)
                                    .collect(Collectors.joining(", "));
                            response.setTextResponse(selectedText);

                            List<UUID> correctIds = allAnswers.stream()
                                    .filter(QuizAnswer::isCorrect)
                                    .map(QuizAnswer::getId)
                                    .collect(Collectors.toList());

                            if (new HashSet<>(correctIds).equals(new HashSet<>(studentIds))) {
                                response.setCorrect(true);
                                response.setPointsEarned(question.getPoints());
                            } else {
                                response.setCorrect(false);
                            }
                        }
                        break;
                    case FILL_BLANK:
                        if (studentAns.getTextResponse() != null) {
                            QuizAnswer correctAnswer = answerRepository.findByQuestionIdOrderByOrderIndexAsc(question.getId())
                                    .stream().findFirst().orElse(null);
                            response.setTextResponse(studentAns.getTextResponse());
                            if (correctAnswer != null && correctAnswer.getContent().trim().equalsIgnoreCase(studentAns.getTextResponse().trim())) {
                                response.setCorrect(true);
                                response.setPointsEarned(question.getPoints());
                            } else {
                                response.setCorrect(false);
                            }
                        }
                        break;
                    case SHORT_ANSWER:
                        response.setTextResponse(studentAns.getTextResponse());
                        break;
                }
            }
            
            responseRepository.save(response);
            totalPointsEarned += response.getPointsEarned();
        }

        int finalPercentage = maxPossiblePoints > 0 ? (totalPointsEarned * 100 / maxPossiblePoints) : 0;
        attempt.setScore(finalPercentage);
        attempt.setPassed(finalPercentage >= quiz.getPassingScore());
        attempt.setSubmittedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        return getAttemptResult(attempt.getId());
    }

    @Transactional(readOnly = true)
    public QuizAttemptResponse getAttemptResult(UUID attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        List<QuizResponse> responses = responseRepository.findByAttempt_Id(attemptId);
        
        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .userId(attempt.getUser().getId())
                .score(attempt.getScore())
                .attemptNumber(attempt.getAttemptNumber())
                .passed(attempt.getPassed())
                .passingScore(attempt.getQuiz().getPassingScore()) // Thêm dòng này
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .responses(responses.stream().map(r -> {
                    String userAnsText = "";
                    if (r.getSelectedAnswer() != null) {
                        userAnsText = r.getSelectedAnswer().getContent();
                    } else if (r.getTextResponse() != null) {
                        // Trường hợp MULTIPLE_CHOICE đã Join sẵn nội dung vào textResponse ở bước Submit
                        userAnsText = r.getTextResponse();
                    }
                    
                    return QuizAttemptResponse.QuestionResultResponse.builder()
                        .questionId(r.getQuestion().getId())
                        .questionContent(r.getQuestion().getContent())
                        .content(userAnsText) // đổi từ userAnswer -> content
                        .correct(r.getCorrect() != null ? r.getCorrect() : false)
                        .points(r.getPointsEarned())
                        .totalPoints(r.getQuestion().getPoints())
                        .explanation(r.getQuestion().getExplanation())
                        .build();
                }).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getMyAttempts(UUID quizId, User student) {
        return attemptRepository.findByQuiz_IdAndUser_Id(quizId, student.getId())
                .stream()
                .map(a -> QuizAttemptResponse.builder()
                        .id(a.getId())
                        .quizId(quizId)
                        .userId(student.getId())
                        .score(a.getScore())
                        .attemptNumber(a.getAttemptNumber())
                        .passed(a.getPassed())
                        .passingScore(a.getQuiz().getPassingScore())
                        .startedAt(a.getStartedAt())
                        .submittedAt(a.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizStatsResponse getQuizStats(UUID quizId) {
        List<QuizAttempt> attempts = attemptRepository.findByQuizId(quizId);
        if (attempts.isEmpty()) {
            return QuizStatsResponse.builder()
                    .quizId(quizId)
                    .averageScore(0)
                    .totalAttempts(0)
                    .passRate(0)
                    .scoreDistribution(new HashMap<>())
                    .mostWrongQuestions(new ArrayList<>())
                    .build();
        }

        double totalScore = attempts.stream()
                .filter(a -> a.getScore() != null)
                .mapToDouble(QuizAttempt::getScore)
                .sum();
        long totalAttempts = attempts.size();
        long passedCount = attempts.stream()
                .filter(a -> a.getPassed() != null && a.getPassed())
                .count();

        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("0-20", attempts.stream().filter(a -> a.getScore() != null && a.getScore() <= 20).count());
        distribution.put("21-40", attempts.stream().filter(a -> a.getScore() != null && a.getScore() > 20 && a.getScore() <= 40).count());
        distribution.put("41-60", attempts.stream().filter(a -> a.getScore() != null && a.getScore() > 40 && a.getScore() <= 60).count());
        distribution.put("61-80", attempts.stream().filter(a -> a.getScore() != null && a.getScore() > 60 && a.getScore() <= 80).count());
        distribution.put("81-100", attempts.stream().filter(a -> a.getScore() != null && a.getScore() > 80).count());

        List<QuizResponse> allResponses = responseRepository.findByAttempt_Quiz_Id(quizId);
        Map<QuizQuestion, Long> wrongCounts = allResponses.stream()
                .filter(r -> r.getCorrect() != null && !r.getCorrect())
                .collect(Collectors.groupingBy(QuizResponse::getQuestion, Collectors.counting()));

        List<QuizStatsResponse.QuestionStats> mostWrong = wrongCounts.entrySet().stream()
                .sorted(Map.Entry.<QuizQuestion, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> QuizStatsResponse.QuestionStats.builder()
                        .questionId(e.getKey().getId())
                        .content(e.getKey().getContent())
                        .wrongCount(e.getValue())
                        .wrongPercentage((double) e.getValue() * 100 / totalAttempts)
                        .build())
                .collect(Collectors.toList());

        return QuizStatsResponse.builder()
                .quizId(quizId)
                .averageScore(totalScore / totalAttempts)
                .totalAttempts(totalAttempts)
                .passRate((double) passedCount * 100 / totalAttempts)
                .scoreDistribution(distribution)
                .mostWrongQuestions(mostWrong)
                .build();
    }
}
