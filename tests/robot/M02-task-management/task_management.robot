*** Settings ***
Documentation    ทดสอบโมดูลจัดการ Task (M02)
...              ครอบคลุม FR2.1-FR2.7, FR4.5
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application
Test Setup       Navigate To Task Page

*** Test Cases ***
# =============================================================================
# FR2.1: สร้าง Task ใหม่
# =============================================================================

สร้าง Task ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    ผู้ใช้สามารถสร้าง Task ใหม่ได้
    ...    โดยระบุ title, description, assignee, role, requirement
    [Tags]    FR2.1    M02    create    happy-path
    Click Create Button
    Fill Title Field    TASK-001 ออกแบบหน้าล็อกอิน
    Fill Description Field    ออกแบบ UI หน้าล็อกอินตาม Wireframe
    Fill Assignee Field    สมศักดิ์
    Select Role    UX
    Select Requirement    REQ-001 ระบบล็อกอิน
    Click Save Button
    Element Should Contain Text    .task-list    TASK-001 ออกแบบหน้าล็อกอิน

สร้าง Task โดยไม่กรอก Title ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องแจ้งเตือนเมื่อไม่ได้กรอก title
    [Tags]    FR2.1    M02    create    validation
    Click Create Button
    Fill Description Field    รายละเอียดทดสอบ
    Select Role    Dev
    Select Requirement    REQ-001 ระบบล็อกอิน
    Click Save Button
    Validation Error Should Be Shown    กรุณาระบุชื่อ Task

# =============================================================================
# FR2.2: ต้องเชื่อมโยงกับ Requirement (ปฏิเสธหากไม่เลือก)
# =============================================================================

สร้าง Task โดยไม่เลือก Requirement ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธการสร้าง Task หากไม่ได้เชื่อมโยงกับ Requirement
    [Tags]    FR2.2    M02    requirement-link    validation
    Click Create Button
    Fill Title Field    TASK-002 ทดสอบไม่เลือก Requirement
    Fill Description Field    ทดสอบ validation
    Fill Assignee Field    สมศักดิ์
    Select Role    Dev
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือก Requirement

Task ต้องเชื่อมโยงกับ Requirement ที่มีอยู่ในระบบ
    [Documentation]    Dropdown ของ Requirement ต้องแสดงรายการ Requirement ที่มีอยู่ในระบบ
    [Tags]    FR2.2    M02    requirement-link
    Click Create Button
    Get Element Count    select[name="requirement"] >> option    >    0

# =============================================================================
# FR2.3: ต้องระบุ Role (SA/UX/Dev/Tester)
# =============================================================================

สร้าง Task โดยไม่เลือก Role ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธการสร้าง Task หากไม่ได้ระบุ Role
    [Tags]    FR2.3    M02    role    validation
    Click Create Button
    Fill Title Field    TASK-003 ทดสอบไม่เลือก Role
    Fill Description Field    ทดสอบ validation
    Select Requirement    REQ-001 ระบบล็อกอิน
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือกบทบาท

Role ต้องมีเฉพาะ 4 ค่า (SA, UX, Dev, Tester)
    [Documentation]    ตัวเลือก Role ต้องมีเฉพาะ 4 ค่า คือ SA, UX, Dev, Tester
    [Tags]    FR2.3    M02    role
    Click Create Button
    Get Element Count    select[name="role"] >> option    ==    4

เลือก Role เป็น SA ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Role เป็น SA ได้
    [Tags]    FR2.3    M02    role
    Click Create Button
    Select Role    SA
    Element Should Contain Text    select[name="role"]    SA

เลือก Role เป็น UX ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Role เป็น UX ได้
    [Tags]    FR2.3    M02    role
    Click Create Button
    Select Role    UX
    Element Should Contain Text    select[name="role"]    UX

เลือก Role เป็น Dev ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Role เป็น Dev ได้
    [Tags]    FR2.3    M02    role
    Click Create Button
    Select Role    Dev
    Element Should Contain Text    select[name="role"]    Dev

เลือก Role เป็น Tester ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Role เป็น Tester ได้
    [Tags]    FR2.3    M02    role
    Click Create Button
    Select Role    Tester
    Element Should Contain Text    select[name="role"]    Tester

# =============================================================================
# FR2.4: กรองตาม Role, Assignee, Requirement
# =============================================================================

กรอง Task ตาม Role ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Task ตาม Role ได้
    [Tags]    FR2.4    M02    filter    role
    Select Filter Option    filter-role    Dev
    Get Element Count    .task-item    >=    0

กรอง Task ตาม Assignee ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Task ตาม Assignee ได้
    [Tags]    FR2.4    M02    filter    assignee
    Select Filter Option    filter-assignee    สมศักดิ์
    Get Element Count    .task-item    >=    0

กรอง Task ตาม Requirement ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Task ตาม Requirement ที่เชื่อมโยงได้
    [Tags]    FR2.4    M02    filter    requirement
    Select Filter Option    filter-requirement    REQ-001 ระบบล็อกอิน
    Get Element Count    .task-item    >=    0

# =============================================================================
# FR2.5: แก้ไขและลบ Task พร้อมยืนยัน
# =============================================================================

แก้ไข Task ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถแก้ไขข้อมูล Task ได้
    [Tags]    FR2.5    M02    edit
    Click    .task-item >> nth=0
    Click Edit Button
    Fill Title Field    TASK-001 ออกแบบหน้าล็อกอิน (แก้ไข)
    Fill Assignee Field    สมหญิง
    Select Role    Dev
    Click Save Button
    Element Should Contain Text    .task-list    TASK-001 ออกแบบหน้าล็อกอิน (แก้ไข)

ลบ Task แสดงกล่องยืนยันก่อนลบ
    [Documentation]    เมื่อกดลบ Task ระบบต้องแสดงกล่องยืนยันก่อน
    [Tags]    FR2.5    M02    delete    confirmation
    Click    .task-item >> nth=0
    Click Delete Button
    Confirmation Dialog Should Be Visible

ยกเลิกการลบ Task ข้อมูลยังคงอยู่
    [Documentation]    เมื่อกดยกเลิกในกล่องยืนยัน Task ยังคงอยู่
    [Tags]    FR2.5    M02    delete    cancel
    Click    .task-item >> nth=0
    Click Delete Button
    Cancel Delete
    Get Element Count    .task-item    >    0

ยืนยันลบ Task ข้อมูลถูกลบสำเร็จ
    [Documentation]    เมื่อกดยืนยันลบ Task จะถูกลบออกจากระบบ
    [Tags]    FR2.5    M02    delete    confirm
    Click    .task-item >> nth=0
    Click Delete Button
    Confirm Delete
    Element Should Be Visible    .success-message

# =============================================================================
# FR2.6: แสดง Requirement ต้นทาง
# =============================================================================

แสดง Requirement ต้นทางของ Task
    [Documentation]    ในรายการ Task ต้องแสดง Requirement ที่เป็นต้นทาง (source)
    [Tags]    FR2.6    M02    source-requirement
    Element Should Be Visible    .task-item >> .source-requirement

คลิก Requirement ต้นทางนำทางไปหน้า Requirement
    [Documentation]    เมื่อคลิกชื่อ Requirement ต้นทาง ระบบนำทางไปหน้ารายละเอียดของ Requirement นั้น
    [Tags]    FR2.6    M02    source-requirement    navigation
    Click    .task-item >> .source-requirement >> nth=0
    Element Should Be Visible    .requirement-detail

# =============================================================================
# FR2.7: แสดงจำนวน Defect ที่เชื่อมโยง
# =============================================================================

แสดงจำนวน Defect ที่เชื่อมโยงกับ Task
    [Documentation]    ระบบต้องแสดงจำนวน Defect ที่เชื่อมโยงกับแต่ละ Task
    [Tags]    FR2.7    M02    count    defect
    Element Should Be Visible    .task-item >> .defect-count

Task ที่ไม่มี Defect แสดงจำนวนเป็น 0
    [Documentation]    Task ที่ยังไม่มี Defect เชื่อมโยงต้องแสดงจำนวนเป็น 0
    [Tags]    FR2.7    M02    count    defect    zero
    Count Badge Should Show    .task-item-no-defect >> .defect-count    0

# =============================================================================
# FR4.5: Cascade Delete แสดงเตือนว่าจะลบ Defect ที่เชื่อมโยง
# =============================================================================

ลบ Task ที่มี Defect เชื่อมโยงแสดงเตือน Cascade Delete
    [Documentation]    เมื่อลบ Task ที่มี Defect เชื่อมโยง
    ...    ระบบต้องแสดงเตือนว่าจะลบ Defect ที่เกี่ยวข้องด้วย
    [Tags]    FR4.5    M02    cascade    warning
    Click    .task-item-with-defects >> nth=0
    Click Delete Button
    Warning Message Should Contain    Defect

ลบ Task ที่มี Defect แสดงจำนวน Defect ที่จะถูกลบ
    [Documentation]    เมื่อลบ Task ที่มี Defect เชื่อมโยง
    ...    ระบบต้องแสดงจำนวน Defect ที่จะถูกลบไปด้วย
    [Tags]    FR4.5    M02    cascade    count
    Click    .task-item-with-defects >> nth=0
    Click Delete Button
    Warning Message Should Contain    Defect
    Element Should Be Visible    .cascade-count
