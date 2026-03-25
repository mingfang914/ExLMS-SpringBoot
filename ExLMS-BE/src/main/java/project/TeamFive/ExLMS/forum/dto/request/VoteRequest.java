package project.TeamFive.ExLMS.forum.dto.request;

import project.TeamFive.ExLMS.forum.entity.ForumVote;
import lombok.Data;

@Data
public class VoteRequest {
    private ForumVote.VoteType voteType;
}
