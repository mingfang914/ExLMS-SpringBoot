package project.TeamFive.ExLMS.forum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.forum.dto.request.TagRequest;
import project.TeamFive.ExLMS.forum.dto.response.TagResponse;
import project.TeamFive.ExLMS.forum.entity.ForumTag;
import project.TeamFive.ExLMS.forum.entity.ForumTagFollower;
import project.TeamFive.ExLMS.forum.repository.ForumTagFollowerRepository;
import project.TeamFive.ExLMS.forum.repository.ForumTagRepository;
import project.TeamFive.ExLMS.forum.util.TagUtils;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumTagService {

    private final ForumTagRepository tagRepository;
    private final ForumTagFollowerRepository followerRepository;

    @Transactional
    public TagResponse createTag(TagRequest request, User creator) {
        String slug = TagUtils.toSlug(request.getName());
        
        ForumTag tag = ForumTag.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#6366F1")
                .createdBy(creator)
                .build();
        
        return TagResponse.fromEntity(tagRepository.save(tag));
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(TagResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void followTag(UUID tagId, User user) {
        ForumTag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        
        if (followerRepository.existsByUserIdAndTagId(user.getId(), tagId)) {
            followerRepository.deleteByUserIdAndTagId(user.getId(), tagId);
        } else {
            ForumTagFollower follower = ForumTagFollower.builder()
                    .user(user)
                    .tag(tag)
                    .build();
            followerRepository.save(follower);
        }
    }

    @Transactional
    public Set<ForumTag> getOrCreateTags(String tagNamesString, User creator) {
        List<String> tagNames = TagUtils.parseTags(tagNamesString);
        if (tagNames.isEmpty()) {
            return Collections.emptySet();
        }

        Set<ForumTag> tags = new HashSet<>();
        for (String name : tagNames) {
            String slug = TagUtils.toSlug(name);
            ForumTag tag = tagRepository.findBySlug(slug)
                    .orElseGet(() -> {
                        ForumTag newTag = ForumTag.builder()
                                .name(name)
                                .slug(slug)
                                .color("#6366F1")
                                .createdBy(creator)
                                .build();
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        return tags;
    }
}
