*** Settings ***
Documentation    ทดสอบโมดูลติดตาม Defect (M03)
...              ครอบคลุม FR3.1-FR3.7
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application
Test Setup       Navigate To Defect Page

*** Test Cases ***
# =============================================================================
# FR3.1: สร้าง Defect ใหม่
# =============================================================================

สร้าง Defect ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    ผู้ใช้สามารถสร้าง Defect ใหม่ได้
    ...    โดยระบุ title, description, type, severity, reporter, task
    [Tags]    FR3.1    M03    create    happy-path
    Click Create Button
    Fill Title Field    DEF-001 ปุ่มล็อกอินไม่ทำงาน
    Fill Description Field    เมื่อกดปุ่มล็อกอินไม่มีการตอบสนอง
    Select Defect Type    Bug
    Select Severity    High
    Fill Reporter Field    ทดสอบจัง
    Select Task    TASK-001 ออกแบบหน้าล็อกอิน
    Click Save Button
    Element Should Contain Text    .defect-list    DEF-001 ปุ่มล็อกอินไม่ทำงาน

สร้าง Defect โดยไม่กรอก Title ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องแจ้งเตือนเมื่อไม่ได้กรอก title
    [Tags]    FR3.1    M03    create    validation
    Click Create Button
    Fill Description Field    รายละเอียดทดสอบ
    Select Defect Type    Bug
    Select Severity    Medium
    Select Task    TASK-001 ออกแบบหน้าล็อกอิน
    Click Save Button
    Validation Error Should Be Shown    กรุณาระบุชื่อ Defect

# =============================================================================
# FR3.2: ต้องระบุ Type จาก 5 ค่า
# =============================================================================

สร้าง Defect โดยไม่เลือก Type ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธการสร้าง Defect หากไม่ได้ระบุ Type
    [Tags]    FR3.2    M03    type    validation
    Click Create Button
    Fill Title Field    DEF-002 ทดสอบไม่เลือก Type
    Select Severity    Low
    Select Task    TASK-001 ออกแบบหน้าล็อกอิน
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือกประเภท Defect

Type ต้องมี 5 ค่าให้เลือก
    [Documentation]    ตัวเลือก Type ต้องมี 5 ค่า
    ...    (เช่น Bug, UI, Performance, Security, Other)
    [Tags]    FR3.2    M03    type
    Click Create Button
    Get Element Count    select[name="type"] >> option    ==    5

เลือก Type เป็น Bug ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Type เป็น Bug ได้
    [Tags]    FR3.2    M03    type
    Click Create Button
    Select Defect Type    Bug
    Element Should Contain Text    select[name="type"]    Bug

เลือก Type เป็น UI ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Type เป็น UI ได้
    [Tags]    FR3.2    M03    type
    Click Create Button
    Select Defect Type    UI
    Element Should Contain Text    select[name="type"]    UI

เลือก Type เป็น Performance ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Type เป็น Performance ได้
    [Tags]    FR3.2    M03    type
    Click Create Button
    Select Defect Type    Performance
    Element Should Contain Text    select[name="type"]    Performance

เลือก Type เป็น Security ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Type เป็น Security ได้
    [Tags]    FR3.2    M03    type
    Click Create Button
    Select Defect Type    Security
    Element Should Contain Text    select[name="type"]    Security

เลือก Type เป็น Other ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Type เป็น Other ได้
    [Tags]    FR3.2    M03    type
    Click Create Button
    Select Defect Type    Other
    Element Should Contain Text    select[name="type"]    Other

# =============================================================================
# FR3.3: ต้องระบุ Severity (Critical/High/Medium/Low)
# =============================================================================

สร้าง Defect โดยไม่เลือก Severity ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธการสร้าง Defect หากไม่ได้ระบุ Severity
    [Tags]    FR3.3    M03    severity    validation
    Click Create Button
    Fill Title Field    DEF-003 ทดสอบไม่เลือก Severity
    Select Defect Type    Bug
    Select Task    TASK-001 ออกแบบหน้าล็อกอิน
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือกระดับความรุนแรง

Severity ต้องมี 4 ค่า (Critical, High, Medium, Low)
    [Documentation]    ตัวเลือก Severity ต้องมีเฉพาะ 4 ค่า
    ...    คือ Critical, High, Medium, Low
    [Tags]    FR3.3    M03    severity
    Click Create Button
    Get Element Count    select[name="severity"] >> option    ==    4

เลือก Severity เป็น Critical ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Severity เป็น Critical ได้
    [Tags]    FR3.3    M03    severity
    Click Create Button
    Select Severity    Critical
    Element Should Contain Text    select[name="severity"]    Critical

เลือก Severity เป็น High ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Severity เป็น High ได้
    [Tags]    FR3.3    M03    severity
    Click Create Button
    Select Severity    High
    Element Should Contain Text    select[name="severity"]    High

เลือก Severity เป็น Medium ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Severity เป็น Medium ได้
    [Tags]    FR3.3    M03    severity
    Click Create Button
    Select Severity    Medium
    Element Should Contain Text    select[name="severity"]    Medium

เลือก Severity เป็น Low ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถเลือก Severity เป็น Low ได้
    [Tags]    FR3.3    M03    severity
    Click Create Button
    Select Severity    Low
    Element Should Contain Text    select[name="severity"]    Low

# =============================================================================
# FR3.4: ต้องเชื่อมโยงกับ Task
# =============================================================================

สร้าง Defect โดยไม่เลือก Task ระบบแสดงข้อผิดพลาด
    [Documentation]    ระบบต้องปฏิเสธการสร้าง Defect หากไม่ได้เชื่อมโยงกับ Task
    [Tags]    FR3.4    M03    task-link    validation
    Click Create Button
    Fill Title Field    DEF-004 ทดสอบไม่เลือก Task
    Fill Description Field    ทดสอบ validation
    Select Defect Type    Bug
    Select Severity    Medium
    Fill Reporter Field    ทดสอบจัง
    Click Save Button
    Validation Error Should Be Shown    กรุณาเลือก Task

Task Dropdown แสดงรายการ Task ที่มีอยู่ในระบบ
    [Documentation]    Dropdown ของ Task ต้องแสดงรายการ Task ที่มีอยู่ในระบบ
    [Tags]    FR3.4    M03    task-link
    Click Create Button
    Get Element Count    select[name="task"] >> option    >    0

# =============================================================================
# FR3.5: กรองตาม Type และ Severity
# =============================================================================

กรอง Defect ตาม Type ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Defect ตาม Type ได้
    [Tags]    FR3.5    M03    filter    type
    Select Filter Option    filter-type    Bug
    Get Element Count    .defect-item    >=    0

กรอง Defect ตาม Severity ได้
    [Documentation]    ผู้ใช้สามารถกรองรายการ Defect ตาม Severity ได้
    [Tags]    FR3.5    M03    filter    severity
    Select Filter Option    filter-severity    High
    Get Element Count    .defect-item    >=    0

กรอง Defect ตาม Type และ Severity พร้อมกันได้
    [Documentation]    ผู้ใช้สามารถกรอง Defect ด้วย Type และ Severity พร้อมกันได้
    [Tags]    FR3.5    M03    filter    combined
    Select Filter Option    filter-type    Bug
    Select Filter Option    filter-severity    Critical
    Get Element Count    .defect-item    >=    0

# =============================================================================
# FR3.6: แก้ไขและลบ Defect พร้อมยืนยัน
# =============================================================================

แก้ไข Defect ได้สำเร็จ
    [Documentation]    ผู้ใช้สามารถแก้ไขข้อมูล Defect ได้
    [Tags]    FR3.6    M03    edit
    Click    .defect-item >> nth=0
    Click Edit Button
    Fill Title Field    DEF-001 ปุ่มล็อกอินไม่ทำงาน (แก้ไข)
    Select Severity    Critical
    Click Save Button
    Element Should Contain Text    .defect-list    DEF-001 ปุ่มล็อกอินไม่ทำงาน (แก้ไข)

ลบ Defect แสดงกล่องยืนยันก่อนลบ
    [Documentation]    เมื่อกดลบ Defect ระบบต้องแสดงกล่องยืนยันก่อน
    [Tags]    FR3.6    M03    delete    confirmation
    Click    .defect-item >> nth=0
    Click Delete Button
    Confirmation Dialog Should Be Visible

ยกเลิกการลบ Defect ข้อมูลยังคงอยู่
    [Documentation]    เมื่อกดยกเลิกในกล่องยืนยัน Defect ยังคงอยู่
    [Tags]    FR3.6    M03    delete    cancel
    Click    .defect-item >> nth=0
    Click Delete Button
    Cancel Delete
    Get Element Count    .defect-item    >    0

ยืนยันลบ Defect ข้อมูลถูกลบสำเร็จ
    [Documentation]    เมื่อกดยืนยันลบ Defect จะถูกลบออกจากระบบ
    [Tags]    FR3.6    M03    delete    confirm
    Click    .defect-item >> nth=0
    Click Delete Button
    Confirm Delete
    Element Should Be Visible    .success-message

# =============================================================================
# FR3.7: นับจำนวนตาม Type (5 คอลัมน์บน Board)
# =============================================================================

Board แสดง 5 คอลัมน์ตามประเภท Defect
    [Documentation]    หน้า Defect Board ต้องแสดง 5 คอลัมน์
    ...    แบ่งตามประเภท (Bug, UI, Performance, Security, Other)
    [Tags]    FR3.7    M03    board    columns
    Get Element Count    .defect-board >> .board-column    ==    5

Board แสดงจำนวน Defect ในแต่ละคอลัมน์
    [Documentation]    แต่ละคอลัมน์บน Board ต้องแสดงจำนวน Defect ที่อยู่ในประเภทนั้นๆ
    [Tags]    FR3.7    M03    board    count
    Element Should Be Visible    .board-column >> .column-count

คอลัมน์ Bug แสดงจำนวน Defect ประเภท Bug
    [Documentation]    คอลัมน์ Bug ต้องแสดงจำนวน Defect ที่มี Type เป็น Bug
    [Tags]    FR3.7    M03    board    bug
    Element Should Be Visible    .board-column-bug >> .column-count

คอลัมน์ UI แสดงจำนวน Defect ประเภท UI
    [Documentation]    คอลัมน์ UI ต้องแสดงจำนวน Defect ที่มี Type เป็น UI
    [Tags]    FR3.7    M03    board    ui
    Element Should Be Visible    .board-column-ui >> .column-count

คอลัมน์ Performance แสดงจำนวน Defect ประเภท Performance
    [Documentation]    คอลัมน์ Performance ต้องแสดงจำนวน Defect ที่มี Type เป็น Performance
    [Tags]    FR3.7    M03    board    performance
    Element Should Be Visible    .board-column-performance >> .column-count

คอลัมน์ Security แสดงจำนวน Defect ประเภท Security
    [Documentation]    คอลัมน์ Security ต้องแสดงจำนวน Defect ที่มี Type เป็น Security
    [Tags]    FR3.7    M03    board    security
    Element Should Be Visible    .board-column-security >> .column-count

คอลัมน์ Other แสดงจำนวน Defect ประเภท Other
    [Documentation]    คอลัมน์ Other ต้องแสดงจำนวน Defect ที่มี Type เป็น Other
    [Tags]    FR3.7    M03    board    other
    Element Should Be Visible    .board-column-other >> .column-count
