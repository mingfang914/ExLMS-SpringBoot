package project.TeamFive.ExLMS.group.service;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.dto.request.CreateGroupRequest;
import project.TeamFive.ExLMS.group.dto.request.UpdateGroupRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupResponse;
import project.TeamFive.ExLMS.group.entity.GroupJoinRequest;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.GroupMemberDetailView;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.group.repository.GroupJoinRequestRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberDetailViewRepository;
import project.TeamFive.ExLMS.service.FileService;

import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMemberDetailViewRepository groupMemberDetailViewRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final FileService fileService;

    // Dùng Transactional để đảm bảo: Nếu lưu Nhóm thành công mà lưu Thành viên lỗi,
    // thì hủy (rollback) toàn bộ, không tạo ra rác trong DB
    @Transactional
    public String createGroup(CreateGroupRequest request) {

        // 1. Lấy thông tin người tạo nhóm từ JWT Token
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Ràng buộc: Chỉ Giảng viên hoặc Admin mới được tạo nhóm
        if (!"INSTRUCTOR".equals(currentUser.getRole().name()) && !"ADMIN".equals(currentUser.getRole().name())) {
            throw new RuntimeException("Chỉ Giảng viên hoặc Quản trị viên mới có quyền tạo Nhóm học tập!");
        }

        // 2. Tạo mã mời
        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 3. Khởi tạo đối tượng Nhóm
        String coverKey = request.getCoverKey();
        if (coverKey == null || coverKey.trim().isEmpty()) {
            coverKey = "DefaultGroupCover.png";
        }

        StudyGroup newGroup = StudyGroup.builder()
                .owner(currentUser)
                .name(request.getName())
                .description(request.getDescription())
                .coverKey(coverKey)
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC")
                .category(request.getCategory())
                .inviteCode(inviteCode)
                .maxMembers(100)
                .memberCount(0)
                .language("vi")
                .status("ACTIVE")
                .autoApprove(request.getAutoApprove() != null ? request.getAutoApprove() : false)
                .build();

        // 4. Lưu Nhóm xuống Database (Lúc này newGroup đã được cấp ID nhị phân)
        studyGroupRepository.save(newGroup);

        // 5. NGAY LẬP TỨC: Tạo bản ghi Thành viên và gán quyền OWNER cho người tạo
        GroupMember ownerMember = GroupMember.builder()
                .group(newGroup)
                .user(currentUser)
                .role("OWNER")
                .status("ACTIVE")
                .approvedBy(currentUser) // Chủ nhóm tự duyệt chính mình
                .build();

        // 6. Lưu vào bảng group_members
        groupMemberRepository.save(ownerMember);

        return "Tạo nhóm học tập thành công! Mã mời của bạn là: " + inviteCode;
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getAllPublicGroups() {
        User currentUser = null;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) currentUser = (User) principal;
        } catch (Exception ignored) {}

        final User cu = currentUser;
        return studyGroupRepository.findAll().stream()
                .filter(group -> "ACTIVE".equals(group.getStatus()) && "PUBLIC".equals(group.getVisibility()))
                .map(group -> mapToGroupResponse(group, cu))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Find all group_member rows for this user using native SQL UNHEX to handle BINARY(16)
        List<GroupMember> myMemberships = groupMemberRepository.findAllByUserId(currentUser.getId().toString());

        return myMemberships.stream()
                .map(gm -> gm.getGroup())
                .filter(group -> "ACTIVE".equals(group.getStatus())) // Include both PUBLIC and PRIVATE
                .distinct()
                .map(group -> mapToGroupResponse(group, currentUser))
                .collect(Collectors.toList());
    }

    // Lấy chi tiết 1 nhóm cụ thể
    @Transactional(readOnly = true)
    public GroupResponse getGroupById(UUID groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập này!"));
        User currentUser = null;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                currentUser = (User) principal;
            }
        } catch (Exception e) {
        }

        return mapToGroupResponse(group, currentUser);
    }

    // ==================== UPDATE (Cập nhật thông tin nhóm) ====================

    @Transactional
    public GroupResponse updateGroup(UUID groupId, UpdateGroupRequest request) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập này!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // BẢO MẬT: Kiểm tra xem user đang gọi API có phải là Owner của nhóm không?
        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Chỉ có Chủ nhóm mới có quyền chỉnh sửa!");
        }

        // Cập nhật các trường dữ liệu
        if (request.getName() != null)
            group.setName(request.getName());
        if (request.getDescription() != null)
            group.setDescription(request.getDescription());
        if (request.getVisibility() != null)
            group.setVisibility(request.getVisibility());
        if (request.getCategory() != null)
            group.setCategory(request.getCategory());
        if (request.getAutoApprove() != null)
            group.setAutoApprove(request.getAutoApprove());

        studyGroupRepository.save(group);
        return mapToGroupResponse(group, currentUser);
    }

    // ==================== DELETE (Xóa nhóm - Xóa mềm) ====================

    @Transactional
    public String deleteGroup(UUID groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập này!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // BẢO MẬT: Chỉ Owner mới được xóa
        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Chỉ có Chủ nhóm mới có quyền xóa nhóm!");
        }

        // Xóa Mềm (Soft Delete): Không gọi lệnh .delete(), chỉ đổi status để giữ lại dữ
        // liệu lịch sử
        group.setStatus("DELETED");
        studyGroupRepository.save(group);

        return "Đã xóa nhóm học tập thành công!";
    }

    // --- Hàm phụ trợ: Chuyển từ Entity sang DTO ---
    private GroupResponse mapToGroupResponse(StudyGroup group, User currentUser) {
        String coverUrl = null;
        if (group.getCoverKey() != null && !group.getCoverKey().trim().isEmpty()) {
            try {
                coverUrl = fileService.getPresignedUrl(group.getCoverKey());
            } catch (Exception e) {
                System.out.println("Failed to get presigned url for coverKey: " + group.getCoverKey());
            }
        }

        String currentUserRole = null;
        boolean isJoined = false;

        if (currentUser != null) {
            java.util.Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupAndUser(group, currentUser);
            if (memberOpt.isPresent()) {
                isJoined = true;
                currentUserRole = memberOpt.get().getRole();
            }
        }

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .ownerName(group.getOwner() != null ? group.getOwner().getFullName() : "Unknown")
                .visibility(group.getVisibility())
                .memberCount(group.getMemberCount())
                .category(group.getCategory())
                .status(group.getStatus())
                .coverUrl(coverUrl)
                .currentUserRole(currentUserRole)
                .isJoined(isJoined)
                .inviteCode(("OWNER".equals(currentUserRole) || "EDITOR".equals(currentUserRole)) ? group.getInviteCode() : null)
                .build();
    }

    @Transactional
    public String joinGroupByInviteCode(String inviteCode) {
        // 1. Lấy thông tin user đang đăng nhập
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Tìm nhóm theo mã mời
        StudyGroup group = studyGroupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Mã mời không hợp lệ hoặc nhóm không tồn tại!"));

        // 3. Kiểm tra trạng thái nhóm
        if (!"ACTIVE".equals(group.getStatus())) {
            throw new RuntimeException("Nhóm này hiện không hoạt động!");
        }

        // 4. Kiểm tra xem nhóm đã đầy chưa
        if (group.getMemberCount() >= group.getMaxMembers()) {
            throw new RuntimeException("Rất tiếc, nhóm đã đạt số lượng thành viên tối đa!");
        }

        // 5. Kiểm tra xem sinh viên đã tham gia nhóm này chưa
        if (groupMemberRepository.existsByGroupAndUser(group, currentUser)) {
            throw new RuntimeException("Bạn đã là thành viên của nhóm này rồi!");
        }

        // 6. Kiểm tra xem có Request PENDING nào chưa
        if (groupJoinRequestRepository.existsByGroupAndUserAndStatus(group, currentUser, "PENDING")) {
            throw new RuntimeException("Bạn đã gửi yêu cầu trước đó rồi, vui lòng chờ duyệt!");
        }

        // 7. Xử lý logic Tham gia ngay (Auto Approve)
        if (group.isAutoApprove()) {
            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(currentUser)
                    .role("MEMBER") 
                    .status("ACTIVE")
                    .build();
            groupMemberRepository.save(newMember);
            return "Chúc mừng! Bạn đã gia nhập thành công nhóm: " + group.getName();
        } else {
            // Nhóm Private hoặc cấu hình duyệt thủ công -> Phải đợi Owner/Editor duyệt
            GroupJoinRequest joinRequest = GroupJoinRequest.builder()
                    .group(group)
                    .user(currentUser)
                    .message("Sử dụng mã mời: " + inviteCode)
                    .status("PENDING")
                    .build();
            groupJoinRequestRepository.save(joinRequest);
            return "Mã mời hợp lệ! Yêu cầu tham gia của bạn đang chờ phê duyệt từ Ban quản trị nhóm.";
        }
    }

    @Transactional(readOnly = true)
    public List<GroupMemberDetailView> getGroupMembers(UUID groupId) {
        // Có thể thêm logic kiểm tra: Chỉ những ai là thành viên nhóm mới được xem danh
        // sách này
        // Hiện tại ta lấy trực tiếp từ View thông qua hàm bin_to_uuid16 mà DB đã cung
        // cấp
        return groupMemberDetailViewRepository.findByGroupId(groupId.toString());
    }

    // ==================== JOIN REQUEST (Gửi yêu cầu & Duyệt) ====================

    // 1. Sinh viên gửi yêu cầu tham gia nhóm Công khai
    @Transactional
    public String createJoinRequest(UUID groupId, String message) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập này!"));

        // Ràng buộc 1: Nhóm phải là PUBLIC
        if (!"PUBLIC".equalsIgnoreCase(group.getVisibility())) {
            throw new RuntimeException("Nhóm này là Private. Bạn chỉ có thể tham gia bằng Mã mời!");
        }
        // Ràng buộc 2: Chưa là thành viên
        if (groupMemberRepository.existsByGroupAndUser(group, currentUser)) {
            throw new RuntimeException("Bạn đã là thành viên của nhóm này rồi!");
        }
        // Ràng buộc 3: Chưa có yêu cầu nào đang chờ
        if (groupJoinRequestRepository.existsByGroupAndUserAndStatus(group, currentUser, "PENDING")) {
            throw new RuntimeException("Bạn đã gửi yêu cầu trước đó rồi, vui lòng chờ duyệt!");
        }

        // Kiểm tra tính năng Auto-Approve
        if (group.isAutoApprove()) {
            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(currentUser)
                    .role("MEMBER")
                    .status("ACTIVE")
                    .build();
            groupMemberRepository.save(newMember);
            return "Gia nhập thành công do nhóm đang bật chế độ 'Tham gia ngay'!";
        }

        GroupJoinRequest req = GroupJoinRequest.builder()
                .group(group)
                .user(currentUser)
                .message(message)
                .status("PENDING")
                .build();

        groupJoinRequestRepository.save(req);
        return "Đã gửi yêu cầu tham gia thành công. Vui lòng chờ Giảng viên phê duyệt!";
    }

    // 2. Giảng viên (Owner/Editor) duyệt yêu cầu
    @Transactional
    public String reviewJoinRequest(UUID requestId, boolean isApproved) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu này!"));

        StudyGroup group = request.getGroup();

        // Kiểm tra quyền: Người đang bấm duyệt có phải là Owner hoặc Editor của nhóm
        // này không?
        GroupMember currentMember = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(currentMember.getRole()) && !"EDITOR".equals(currentMember.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền duyệt thành viên!");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Yêu cầu này đã được xử lý trước đó!");
        }

        // Cập nhật trạng thái yêu cầu
        request.setStatus(isApproved ? "APPROVED" : "REJECTED");
        request.setReviewedBy(currentUser);
        request.setReviewedAt(LocalDateTime.now());
        groupJoinRequestRepository.save(request);

        // Nếu Đồng ý -> Tạo thẻ thành viên (Trigger DB sẽ tự cộng member_count)
        if (isApproved) {
            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(request.getUser())
                    .role("MEMBER")
                    .status("ACTIVE")
                    .approvedBy(currentUser)
                    .build();
            groupMemberRepository.save(newMember);
            return "Đã PHÊ DUYỆT yêu cầu và thêm sinh viên vào nhóm!";
        }

        return "Đã TỪ CHỐI yêu cầu tham gia.";
    }

    // 3. Owner/Editor lấy danh sách yêu cầu đang chờ duyệt
    @Transactional(readOnly = true)
    public List<project.TeamFive.ExLMS.group.dto.response.JoinRequestResponse> getPendingJoinRequests(UUID groupId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm này!"));

        // Kiểm tra quyền
        GroupMember currentMember = groupMemberRepository.findByGroupIdAndUserId(group.getId().toString(), currentUser.getId().toString())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(currentMember.getRole()) && !"EDITOR".equals(currentMember.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc Biên tập viên mới được xem danh sách yêu cầu!");
        }

        return groupJoinRequestRepository.findPendingByGroupId(groupId.toString(), "PENDING")
                .stream()
                .map(req -> project.TeamFive.ExLMS.group.dto.response.JoinRequestResponse.builder()
                        .requestId(req.getId())
                        .studentName(req.getUser().getFullName())
                        .studentEmail(req.getUser().getEmail())
                        .message(req.getMessage())
                        .status(req.getStatus())
                        .createdAt(req.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ==================== MEMBER MANAGEMENT (Owner / Editor) ====================

    // 1. Thăng/giáng cấp thành viên (Owner only)
    @Transactional
    public String changeMemberRole(UUID groupId, UUID targetUserId, String newRole) {
        if (!newRole.equals("EDITOR") && !newRole.equals("MEMBER")) {
            throw new RuntimeException("Quyền mới không hợp lệ! Chỉ nhận EDITOR hoặc MEMBER.");
        }

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Kiểm tra Owner
        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Chỉ Chủ nhóm mới có quyền thay đổi vai trò thành viên!");
        }

        if (targetUserId.equals(currentUser.getId())) {
            throw new RuntimeException("Không thể tự đổi quyền của chính mình!");
        }

        GroupMember targetMember = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng này không phải là thành viên nhóm!"));

        if ("OWNER".equals(targetMember.getRole())) {
            throw new RuntimeException("Không thể giáng cấp Chủ nhóm!");
        }

        targetMember.setRole(newRole);
        groupMemberRepository.save(targetMember);
        return "Đã cập nhật quyền thành công!";
    }

    // 2. Xóa thành viên
    @Transactional
    public String removeMember(UUID groupId, UUID targetUserId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (targetUserId.equals(currentUser.getId())) {
            throw new RuntimeException("Không thể tự xóa chính mình bằng chức năng này! Hãy dùng tính năng Rời nhóm.");
        }

        GroupMember currentMember = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));

        GroupMember targetMember = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng này không phải là thành viên nhóm!"));

        if ("OWNER".equals(targetMember.getRole())) {
            throw new RuntimeException("Không thể xóa Chủ nhóm khỏi nhóm!!");
        }

        if ("OWNER".equals(currentMember.getRole())) {
            // Owner có quyền xóa bất cứ ai
            groupMemberRepository.delete(targetMember);
        } else if ("EDITOR".equals(currentMember.getRole())) {
            // Editor chỉ xóa được Member
            if (!"MEMBER".equals(targetMember.getRole())) {
                throw new RuntimeException("Biên tập viên không có quyền xóa Biên tập viên khác hoặc Chủ nhóm!");
            }
            groupMemberRepository.delete(targetMember);
        } else {
            throw new RuntimeException("Thành viên thường không có quyền xóa người khác!");
        }

        return "Đã xóa thành viên khỏi nhóm thành công!";
    }

    // 3. Chuyển nhượng Owner
    @Transactional
    public String transferOwnership(UUID groupId, UUID newOwnerId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Chỉ Chủ nhóm hiện tại mới có quyền chuyển nhượng!");
        }

        if (newOwnerId.equals(currentUser.getId())) {
            throw new RuntimeException("Bạn đã là Chủ nhóm rồi!");
        }

        GroupMember currentMember = groupMemberRepository
                .findByGroup_IdAndUser_Id(group.getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu: Không tìm thấy thẻ thành viên Owner."));

        GroupMember targetMember = groupMemberRepository
                .findByGroup_IdAndUser_Id(groupId, newOwnerId)
                .orElseThrow(() -> new RuntimeException("Người được chỉ định không phải là thành viên nhóm!"));

        // 1. Thăng target lên Owner
        targetMember.setRole("OWNER");
        groupMemberRepository.save(targetMember);

        // 2. Giáng current xuống Editor
        currentMember.setRole("EDITOR");
        groupMemberRepository.save(currentMember);

        // 3. Đổi owner của group entity
        group.setOwner(targetMember.getUser());
        studyGroupRepository.save(group);

        return "Đã chuyển nhượng quyền Chủ nhóm thành công!";
    }


    // Tái tạo lại mã mời (Regenerate Invite Code)
    @Transactional
    public String regenerateInviteCode(UUID groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // BẢO MẬT: Chỉ Owner hoặc Editor mới được tạo lại mã mời
        GroupMember currentMember = groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));

        if (!"OWNER".equals(currentMember.getRole()) && !"EDITOR".equals(currentMember.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc BTV mới có quyền thay đổi mã mời!");
        }

        String newCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        group.setInviteCode(newCode);
        studyGroupRepository.save(group);

        return newCode;
    }
}
