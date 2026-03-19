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

    // Dùng Transactional để đảm bảo: Nếu lưu Nhóm thành công mà lưu Thành viên lỗi, thì hủy (rollback) toàn bộ, không tạo ra rác trong DB
    @Transactional 
    public String createGroup(CreateGroupRequest request) {
        
        // 1. Lấy thông tin người tạo nhóm từ JWT Token
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Tạo mã mời
        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 3. Khởi tạo đối tượng Nhóm
        StudyGroup newGroup = StudyGroup.builder()
                .owner(currentUser)
                .name(request.getName())
                .description(request.getDescription())
                .coverKey(request.getCoverKey()) // Cần thêm field này vào CreateGroupRequest
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC")
                .category(request.getCategory())
                .inviteCode(inviteCode)
                .maxMembers(100)
                .memberCount(1)
                .language("vi")
                .status("ACTIVE")
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
        return studyGroupRepository.findAll().stream()
                .filter(group -> "ACTIVE".equals(group.getStatus()) && "PUBLIC".equals(group.getVisibility()))
                .map(this::mapToGroupResponse)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết 1 nhóm cụ thể
    public GroupResponse getGroupById(UUID groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập này!"));
        return mapToGroupResponse(group);
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
        if (request.getName() != null) group.setName(request.getName());
        if (request.getDescription() != null) group.setDescription(request.getDescription());
        if (request.getVisibility() != null) group.setVisibility(request.getVisibility());
        if (request.getCategory() != null) group.setCategory(request.getCategory());

        studyGroupRepository.save(group);
        return mapToGroupResponse(group);
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

        // Xóa Mềm (Soft Delete): Không gọi lệnh .delete(), chỉ đổi status để giữ lại dữ liệu lịch sử
        group.setStatus("DELETED");
        studyGroupRepository.save(group);

        return "Đã xóa nhóm học tập thành công!";
    }

    // --- Hàm phụ trợ: Chuyển từ Entity sang DTO ---
    private GroupResponse mapToGroupResponse(StudyGroup group) {
        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .ownerName(group.getOwner().getFullName())
                .visibility(group.getVisibility())
                .memberCount(group.getMemberCount())
                .category(group.getCategory())
                .status(group.getStatus())
                .coverUrl(fileService.getPresignedUrl(group.getCoverKey()))
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

        // 6. Tạo thẻ thành viên mới
        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(currentUser)
                .role("MEMBER") // Mặc định vào bằng mã mời thì làm Member
                .status("ACTIVE")
                // Không cần gán joinedAt vì @PrePersist đã lo
                // Không cần approvedBy vì vào bằng mã mời xem như duyệt tự động
                .build();

        // 7. Lưu xuống DB (Lúc này Trigger của MySQL sẽ tự động chạy để cộng member_count)
        groupMemberRepository.save(newMember);

        return "Chúc mừng! Bạn đã gia nhập thành công nhóm: " + group.getName();
    }
    
    @Transactional(readOnly = true)
    public List<GroupMemberDetailView> getGroupMembers(UUID groupId) {
        // Có thể thêm logic kiểm tra: Chỉ những ai là thành viên nhóm mới được xem danh sách này
        // Hiện tại ta lấy trực tiếp từ View thông qua hàm bin_to_uuid16 mà DB đã cung cấp
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

        GroupJoinRequest request = GroupJoinRequest.builder()
                .group(group)
                .user(currentUser)
                .message(message)
                .status("PENDING")
                .build();
        
        groupJoinRequestRepository.save(request);
        return "Đã gửi yêu cầu tham gia thành công. Vui lòng chờ Giảng viên phê duyệt!";
    }

    // 2. Giảng viên (Owner/Editor) duyệt yêu cầu
    @Transactional
    public String reviewJoinRequest(UUID requestId, boolean isApproved) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu này!"));

        StudyGroup group = request.getGroup();

        // Kiểm tra quyền: Người đang bấm duyệt có phải là Owner hoặc Editor của nhóm này không?
        GroupMember currentMember = groupMemberRepository.findByGroupAndUser(group, currentUser)
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

    // [READ] Lấy danh sách các yêu cầu đang chờ duyệt của nhóm
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getPendingJoinRequests(UUID groupId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm!"));

        // BẢO MẬT: Chỉ Owner hoặc Editor mới được xem danh sách này
        GroupMember currentMember = groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm!"));
        
        if (!"OWNER".equals(currentMember.getRole()) && !"EDITOR".equals(currentMember.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc BTV mới có quyền xem yêu cầu!");
        }

        // Lấy danh sách PENDING và map sang dạng dữ liệu đơn giản trả về
        return groupJoinRequestRepository.findByGroup_IdAndStatus(groupId, "PENDING").stream()
                .map(req -> java.util.Map.<String, Object>of( 
                        "requestId", req.getId(),
                        "studentName", req.getUser().getFullName(),
                        "studentEmail", req.getUser().getEmail(),
                        "message", req.getMessage() != null ? req.getMessage() : "",
                        "createdAt", req.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
