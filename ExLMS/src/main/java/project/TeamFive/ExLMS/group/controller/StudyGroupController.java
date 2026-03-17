package project.TeamFive.ExLMS.group.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.group.dto.request.CreateGroupRequest;
import project.TeamFive.ExLMS.group.dto.request.UpdateGroupRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupResponse;
import project.TeamFive.ExLMS.group.entity.GroupMemberDetailView;
import project.TeamFive.ExLMS.group.service.StudyGroupService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    // API tạo nhóm (Sẽ bị chặn nếu không có Token)
    @PostMapping
    public ResponseEntity<String> createGroup(@RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(studyGroupService.createGroup(request));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getAllPublicGroups() {
        return ResponseEntity.ok(studyGroupService.getAllPublicGroups());
    }

    // [READ] Lấy chi tiết nhóm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(studyGroupService.getGroupById(id));
    }

    // [UPDATE] Cập nhật nhóm
    @PutMapping("/{id}")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable UUID id, 
            @RequestBody UpdateGroupRequest request) {
        return ResponseEntity.ok(studyGroupService.updateGroup(id, request));
    }

    // [DELETE] Xóa mềm nhóm
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGroup(@PathVariable UUID id) {
        return ResponseEntity.ok(studyGroupService.deleteGroup(id));
    }

    // [JOIN] Gia nhập nhóm bằng mã mời
    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<String> joinGroup(@PathVariable String inviteCode) {
        return ResponseEntity.ok(studyGroupService.joinGroupByInviteCode(inviteCode));
    }

    // [READ] Lấy danh sách thành viên của nhóm
    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDetailView>> getGroupMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(studyGroupService.getGroupMembers(id));
    }

    // [JOIN REQUEST] Sinh viên gửi yêu cầu xin vào nhóm Public
    @PostMapping("/{id}/join-requests")
    public ResponseEntity<String> createJoinRequest(
            @PathVariable UUID id, 
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String message = (body != null) ? body.get("message") : "Em muốn tham gia lớp học ạ.";
        return ResponseEntity.ok(studyGroupService.createJoinRequest(id, message));
    }

    // [JOIN REQUEST] Giảng viên duyệt yêu cầu
    @PutMapping("/join-requests/{requestId}/review")
    public ResponseEntity<String> reviewJoinRequest(
            @PathVariable UUID requestId, 
            @RequestParam boolean approve) {
        return ResponseEntity.ok(studyGroupService.reviewJoinRequest(requestId, approve));
    }
    // [READ] Lấy danh sách yêu cầu chờ duyệt
    @GetMapping("/{id}/join-requests/pending")
    public ResponseEntity<?> getPendingJoinRequests(@PathVariable UUID id) {
        return ResponseEntity.ok(studyGroupService.getPendingJoinRequests(id));
    }
}
