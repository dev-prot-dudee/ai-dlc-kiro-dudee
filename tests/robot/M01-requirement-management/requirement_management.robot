*** Settings ***
Documentation    ทดสอบโมดูลจัดการ Requirement (M01)
...              ครอบคลุม FR1.1-FR1.7, FR4.3, FR4.4
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application
Test Setup       Navigate To Requirement Page

*** Test Cases ***
# =============================================================================
# FR1.1: สร้าง Requirement ใหม่
# =============================================================================

สร้าง Requirement ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    ผู้ใช้สามารถสร้าง Requirement ใหม่ได้
    ...    โดยระบุ title, description, category, priority, owner
    [Tags]    FR1.1    M01    create    happy-path
    Click Create Button
    Fill Title Field    REQ-001 ระบบล็อกอิน
    Fill Description Field    ผู้ใช้สามารถล็อกอินด้วย email และรหัสผ่าน
    Select Category    Functional
    Select Priority    Must
    Fill Owner Field    สมชาย
    Click Save Button
    Element Should Contain Text    .requirement-list    REQ-001 ระบบล็อกอิน

สร้าง Requirement โดยไม่กรอก title ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องแจ้งเตือนเมื่อไม่ได้กรอก title
    [Tags]    FR1.1    M01    create    validation
    Click Create Button
    Fill Description Field    รายละเอียดทดสอบ
    Select Category    Functional
    Click Save Button
    Validation Error Should Be Shown    กรุณาระบุชื่อ Requirement

# =============================================================================
# FR1.2: หมวดหมู่ต้องเป็น Functional หรือ Non-Functional
# =============================================================================

เลือก Category เป็น Functional ได้สำเร็จ
    [Documentation]    ระบบต้องรองรับ Category เป็น Functional
    [Tags]    FR1.2    M01    category
    Click Create Button
    Fill Title Field    REQ-002 ทดสอบ Category
    Select Category    Functional
    Element Should Contain Text    select[name="category"]    Functional

เลือก Category เป็น Non-Functional ได้สำเร็จ
    [Documentation]    ระบบต้องรองรับ Category เป็น Non-Functional
    [Tags]    FR1.2    M01    category
    Click Create Button
    Fill Title Field    REQ-003 ทดสอบ Category
    Select Category    Non-Functional
    Element Should Contain Text    select[name="category"]    Non-Functional

ไม่เลือก Category ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธเมื่อไม่ได้เลือก Category (ค่าว่าง)
    [Tags]    FR1.2    M01    category    validation
    Click Create Button
    Fill Title Field    REQ-004 ไม่เลือก Category
    Fill Description Field    ทดสอบไม่เลือก Category
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือกหมวดหมู่

# =============================================================================
# FR1.3: ค่าเริ่มต้น Priority เป็น Should, ใช้ MoSCoW เท่านั้น
# =============================================================================

Priority มีค่าเริ่มต้นเป็น Should
    [Documentation]    เมื่อสร้าง Requirement ใหม่ ค่า Priority เริ่มต้นต้องเป็น Should
    [Tags]    FR1.3    M01    priority    default
    Click Create Button
    Element Should Contain Text    select[name="priority"]    Should

Priority ต้องเป็นค่า MoSCoW เท่านั้น (Must, Should, Could, Won't)
    [Documentation]    ตัวเลือก Priority ต้องมีเฉพาะค่า MoSCoW
    ...    ได้แก่ Must, Should, Could, Won't
    [Tags]    FR1.3    M01    priority    moscow
    Click Create Button
    Get Element Count    select[name="priority"] >> option    ==    4

เลือก Priority เป็น Must ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Priority เป็น Must ได้
    [Tags]    FR1.3    M01    priority
    Click Create Button
    Select Priority    Must
    Element Should Contain Text    select[name="priority"]    Must

เลือก Priority เป็น Could ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Priority เป็น Could ได้
    [Tags]    FR1.3    M01    priority
    Click Create Button
    Select Priority    Could
    Element Should Contain Text    select[name="priority"]    Could

เลือก Priority เป็น Won't ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Priority เป็น Won't ได้
    [Tags]    FR1.3    M01    priority
    Click Create Button
    Select Priority    Won't
    Element Should Contain Text    select[name="priority"]    Won't

# =============================================================================
# FR1.4: กรองตาม Category, Priority และค้นหาด้วยข้อความ
# =============================================================================

กรอง Requirement ตาม Category ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Requirement ตาม Category ได้
    [Tags]    FR1.4    M01    filter    category
    Select Filter Option    filter-category    Functional
    Get Element Count    .requirement-item    >    0

กรอง Requirement ตาม Priority ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Requirement ตาม Priority ได้
    [Tags]    FR1.4    M01    filter    priority
    Select Filter Option    filter-priority    Must
    Get Element Count    .requirement-item    >    0

ค้นหา Requirement ด้วยข้อความได้
    [Documentation]    ผู้ใช้สามารถค้นหา Requirement ด้วยข้อความ (text search) ได้
    [Tags]    FR1.4    M01    search
    Fill Search Field    ระบบล็อกอิน
    Get Element Count    .requirement-item    >    0

ค้นหา Requirement ที่ไม่มีอยู่แสดงผลว่างเปล่า
    [Documentation]    เมื่อค้นหาข้อความที่ไม่ตรงกับ Requirement ใดๆ แสดงผลว่างเปล่า
    [Tags]    FR1.4    M01    search    empty
    Fill Search Field    ข้อความที่ไม่มีอยู่จริง12345
    Get Element Count    .requirement-item    ==    0

# =============================================================================
# FR1.5: แก้ไขทุกฟิลด์ได้
# =============================================================================

แก้ไข Title ของ Requirement ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถแก้ไข title ของ Requirement ที่มีอยู่ได้
    [Tags]    FR1.5    M01    edit
    Click    .requirement-item >> nth=0
    Click Edit Button
    Fill Title Field    REQ-001 ระบบล็อกอิน (แก้ไขแล้ว)
    Click Save Button
    Element Should Contain Text    .requirement-list    REQ-001 ระบบล็อกอิน (แก้ไขแล้ว)

แก้ไข Description ของ Requirement ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถแก้ไข description ของ Requirement ได้
    [Tags]    FR1.5    M01    edit
    Click    .requirement-item >> nth=0
    Click Edit Button
    Fill Description Field    รายละเอียดที่แก้ไขแล้ว
    Click Save Button
    Element Should Contain Text    .requirement-detail    รายละเอียดที่แก้ไขแล้ว

แก้ไข Category ของ Requirement ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Category ของ Requirement ได้
    [Tags]    FR1.5    M01    edit    category
    Click    .requirement-item >> nth=0
    Click Edit Button
    Select Category    Non-Functional
    Click Save Button
    Element Should Contain Text    .requirement-detail    Non-Functional

แก้ไข Priority ของ Requirement ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Priority ของ Requirement ได้
    [Tags]    FR1.5    M01    edit    priority
    Click    .requirement-item >> nth=0
    Click Edit Button
    Select Priority    Could
    Click Save Button
    Element Should Contain Text    .requirement-detail    Could

แก้ไข Owner ของ Requirement ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเปลี่ยน Owner ของ Requirement ได้
    [Tags]    FR1.5    M01    edit    owner
    Click    .requirement-item >> nth=0
    Click Edit Button
    Fill Owner Field    สมหญิง
    Click Save Button
    Element Should Contain Text    .requirement-detail    สมหญิง

# =============================================================================
# FR1.6: ลบพร้อมยืนยัน และแจ้งเตือน Cascade Delete
# =============================================================================

ลบ Requirement แสดงกล่องยืนยันก่อนลบ
    [Documentation]    เมื่อกดลบ Requirement ระบบต้องแสดงกล่องยืนยันก่อน
    [Tags]    FR1.6    M01    delete    confirmation
    Click    .requirement-item >> nth=0
    Click Delete Button
    Confirmation Dialog Should Be Visible

ยกเลิกการลบ Requirement ข้อมูลยังคงอยู่
    [Documentation]    เมื่อกดยกเลิกในกล่องยืนยัน Requirement ยังคงอยู่
    [Tags]    FR1.6    M01    delete    cancel
    Click    .requirement-item >> nth=0
    Click Delete Button
    Cancel Delete
    Get Element Count    .requirement-item    >    0

ยืนยันลบ Requirement ข้อมูลถูกลบสำเร็จ
    [Documentation]    เมื่อกดยืนยันลบ Requirement จะถูกลบออกจากระบบ
    [Tags]    FR1.6    M01    delete    confirm
    Click    .requirement-item >> nth=0
    Click Delete Button
    Confirm Delete
    Element Should Be Visible    .success-message

ลบ Requirement ที่มี Task เชื่อมโยงแสดงเตือน Cascade Delete
    [Documentation]    เมื่อลบ Requirement ที่มี Task เชื่อมโยง
    ...    ระบบต้องแสดงเตือนว่าจะลบข้อมูลที่เกี่ยวข้องด้วย
    [Tags]    FR1.6    FR4.4    M01    delete    cascade
    Click    .requirement-item-with-tasks >> nth=0
    Click Delete Button
    Warning Message Should Contain    Task

# =============================================================================
# FR1.7: แสดงจำนวน Task และ Defect ที่เชื่อมโยง
# =============================================================================

แสดงจำนวน Task ที่เชื่อมโยงกับ Requirement
    [Documentation]    ระบบต้องแสดงจำนวน Task ที่เชื่อมโยงกับแต่ละ Requirement
    [Tags]    FR1.7    M01    count    task
    Element Should Be Visible    .requirement-item >> .task-count

แสดงจำนวน Defect ที่เชื่อมโยงกับ Requirement
    [Documentation]    ระบบต้องแสดงจำนวน Defect ที่เชื่อมโยงกับแต่ละ Requirement
    [Tags]    FR1.7    M01    count    defect
    Element Should Be Visible    .requirement-item >> .defect-count

# =============================================================================
# FR4.3: แสดงเตือนเมื่อไม่มี Task เชื่อมโยง
# =============================================================================

Requirement ที่ไม่มี Task เชื่อมโยงแสดงสัญลักษณ์เตือน
    [Documentation]    ระบบต้องแสดงสัญลักษณ์เตือนสำหรับ Requirement ที่ยังไม่มี Task เชื่อมโยง
    ...    เพื่อแจ้งเตือนว่ายังไม่ได้นำไปสร้างงาน
    [Tags]    FR4.3    M01    warning    no-task
    Element Should Be Visible    .requirement-item >> .no-task-warning

คลิกสัญลักษณ์เตือนแสดงข้อความว่าไม่มี Task
    [Documentation]    เมื่อคลิกสัญลักษณ์เตือน ระบบแสดงข้อความอธิบายว่าไม่มี Task เชื่อมโยง
    [Tags]    FR4.3    M01    warning    no-task
    Click    .requirement-item >> .no-task-warning
    Element Should Contain Text    .warning-tooltip    ไม่มี Task เชื่อมโยง

# =============================================================================
# FR4.4: Cascade Delete แสดงจำนวนรายการที่จะถูกลบ
# =============================================================================

ลบ Requirement ที่มี Task เชื่อมโยงแสดงจำนวน Task ที่จะถูกลบ
    [Documentation]    เมื่อลบ Requirement ที่มี Task เชื่อมโยง
    ...    ระบบต้องแสดงจำนวน Task ที่จะถูกลบไปด้วย (Cascade Delete)
    [Tags]    FR4.4    M01    cascade    count
    Click    .requirement-item-with-tasks >> nth=0
    Click Delete Button
    Warning Message Should Contain    Task
    Element Should Be Visible    .cascade-count

ลบ Requirement ที่มี Task และ Defect แสดงจำนวนทั้งหมดที่จะถูกลบ
    [Documentation]    เมื่อลบ Requirement ที่มีทั้ง Task และ Defect เชื่อมโยง
    ...    ระบบต้องแสดงจำนวน Task และ Defect ที่จะถูกลบทั้งหมด
    [Tags]    FR4.4    M01    cascade    count
    Click    .requirement-item-with-tasks >> nth=0
    Click Delete Button
    Warning Message Should Contain    Task
    Warning Message Should Contain    Defect
    Element Should Be Visible    .cascade-count
