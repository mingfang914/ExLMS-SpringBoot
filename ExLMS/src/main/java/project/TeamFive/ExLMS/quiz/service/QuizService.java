package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.entity.Quiz;
import project.TeamFive.ExLMS.quiz.entity.QuizAnswer;
import project.TeamFive.ExLMS.quiz.entity.QuizQuestion;
import project.TeamFive.ExLMS.quiz.repository.QuizAnswerRepository;
import project.TeamFive.ExLMS.quiz.repository.QuizQuestionRepository;
import project.TeamFive.ExLMS.quiz.repository.QuizRepository;
import project.TeamFive.ExLMS.course.repository.CourseRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public QuizResponseDTO createQuiz(UUID courseId, CreateQuizRequest request, User creator) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

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
}
