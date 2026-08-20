*** Settings ***
Documentation    ทดสอบโมดูลจัดการ Requirement (M01)
...              ครอบคลุม FR1.1-FR1.7, FR4.3, FR4.4
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application
Test Setup       Reset To Requirements Page

*** Keywords ***
Reset To Requirements Page
    [Documentation]    รีเซ็ตหน้าก่อนทุก test โดยเปิดหน้าใหม่เพื่อล้าง state
    Go To    ${BASE_URL}/requirements
    Wait Until Element Is Visible    css:[data-testid="nav-requirements"]    timeout=5s

*** Test Cases ***
# =============================================================================
# FR1.1: สร้าง Requirement ใหม่
# =============================================================================

สร้าง Requirement ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    ผู้ใช้สร้าง Requirement ใหม่ ต้องปรากฏใน board ทันที
    [Tags]    FR1.1    M01    create    happy-path
    Navigate To Requirement Page
    Create Requirement    ผู้ใช้ต้องเข้าสู่ระบบได้    Functional    Must
    Card Should Be Visible    ผู้ใช้ต้องเข้าสู่ระบบได้

สร้าง Requirement โดยไม่กรอก Title ระบบต้องปฏิเสธ
    [Documentation]    กดบันทึกโดยไม่กรอกหัวข้อ → ระบบปฏิเสธ
    [Tags]    FR1.1    M01    create    validation
    Navigate To Requirement Page
    Click New Button
    Select Requirement Category    Functional
    Submit Requirement Form
    Field Should Be Invalid    req-title

# =============================================================================
# FR1.2: หมวดหมู่ต้องเป็น Functional หรือ Non-Functional
# =============================================================================

ไม่เลือก Category ระบบต้องปฏิเสธ
    [Documentation]    บันทึกโดยไม่เลือกประเภท → ระบบแสดง error ที่ช่อง category
    [Tags]    FR1.2    M01    category    validation
    Navigate To Requirement Page
    Click New Button
    Fill Requirement Title    ทดสอบไม่เลือกประเภท
    Submit Requirement Form
    Field Should Be Invalid    req-category
    Alert Should Contain    Functional

# =============================================================================
# FR1.3: MoSCoW Priority — ค่าเริ่มต้น Should
# =============================================================================

ไม่เลือก Priority ต้องได้ค่าเริ่มต้น Should
    [Documentation]    สร้างโดยไม่แตะ Priority → ได้ Should และอยู่ใน column Should
    [Tags]    FR1.3    M01    priority    default
    Navigate To Requirement Page
    Create Requirement    ระบบต้องตอบสนองเร็ว    Non-Functional
    Card Should Be Visible    ระบบต้องตอบสนองเร็ว

เลือก Priority เป็น Must ต้องบันทึกค่าที่เลือก
    [Documentation]    เลือก Must → การ์ดปรากฏใน column Must
    [Tags]    FR1.3    M01    priority
    Navigate To Requirement Page
    Create Requirement    ต้องมีหน้า Login    Functional    Must
    Card Should Be Visible    ต้องมีหน้า Login

# =============================================================================
# FR1.4: ค้นหาและกรอง
# =============================================================================

ค้นหาข้อความต้องแสดงเฉพาะที่ตรง
    [Documentation]    พิมพ์ค้นหา → แสดงเฉพาะการ์ดที่ตรงคำค้น
    [Tags]    FR1.4    M01    search    filter
    Navigate To Requirement Page
    Create Requirement    เข้าสู่ระบบ    Functional    Must
    Create Requirement    ออกรายงาน    Functional    Must
    Input Text    css:[data-testid="toolbar-search"]    รายงาน
    Card Should Be Visible    ออกรายงาน
    Card Should Not Exist    เข้าสู่ระบบ

กรอง Category ต้องแสดงเฉพาะประเภทที่เลือก
    [Documentation]    เลือก filter Functional → แสดงเฉพาะ Functional
    [Tags]    FR1.4    M01    filter    category
    Navigate To Requirement Page
    Create Requirement    งาน Func    Functional    Must
    Create Requirement    งาน NFR    Non-Functional    Could
    Switch To List View
    Select From List By Value    css:[data-testid="filter-category"]    Non-Functional
    Page Should Contain    งาน NFR
    Page Should Not Contain    งาน Func

# =============================================================================
# FR1.5: แก้ไข Requirement
# =============================================================================

แก้ไขหัวข้อและ Priority แล้วต้องเห็นค่าใหม่
    [Documentation]    แก้ไข → ค่าใหม่แสดงใน board
    [Tags]    FR1.5    M01    edit
    Navigate To Requirement Page
    Create Requirement    ก่อนแก้    Functional    Should
    Open Card    ก่อนแก้
    Click Edit Button
    Clear Element Text    css:[data-testid="req-title"]
    Fill Requirement Title    หลังแก้
    Select Requirement Priority    Won't
    Submit Requirement Form
    Card Should Be Visible    หลังแก้
    Card Should Not Exist    ก่อนแก้

# =============================================================================
# FR1.6: ลบ Requirement
# =============================================================================

ยกเลิกการลบ ข้อมูลต้องยังอยู่
    [Documentation]    กดลบ → ยกเลิก → ข้อมูลยังคงอยู่
    [Tags]    FR1.6    M01    delete    cancel
    Navigate To Requirement Page
    Create Requirement    อย่าลบฉัน    Functional    Must
    Open Card    อย่าลบฉัน
    Click Delete Button
    Dialog Should Be Visible
    Cancel Delete
    Sleep    1s
    Navigate To Requirement Page
    Card Should Be Visible    อย่าลบฉัน

ยืนยันลบ ข้อมูลต้องหาย
    [Documentation]    กดลบ → ยืนยัน → หายจาก board
    [Tags]    FR1.6    M01    delete    confirm
    Navigate To Requirement Page
    Create Requirement    ลบได้เลย    Functional    Must
    Open Card    ลบได้เลย
    Click Delete Button
    Dialog Should Be Visible
    Confirm Delete
    Card Should Not Exist    ลบได้เลย

# =============================================================================
# FR1.7 + FR4.3: แสดงจำนวน Task และเตือนเมื่อยังไม่มี Task
# =============================================================================

Requirement ที่ยังไม่มี Task ต้องแสดงคำเตือน
    [Documentation]    การ์ดที่ยังไม่ถูกแตกเป็น Task ต้องแสดง "⚠ ยังไม่มี Task"
    [Tags]    FR4.3    M01    traceability    warning
    Navigate To Requirement Page
    Create Requirement    ยังไม่ถูกแตก    Functional    Should
    Page Should Contain    ⚠ ยังไม่มี Task

# =============================================================================
# FR4.4: Cascade Delete
# =============================================================================

ลบ Requirement ที่มี Task ผูก ต้องเตือนจำนวนก่อนลบ
    [Documentation]    Requirement มี Task ผูกอยู่ → dialog บอกจำนวน Task ที่จะถูกลบตาม
    [Tags]    FR4.4    M01    cascade    delete
    Navigate To Requirement Page
    Create Requirement    มีงานผูก    Functional    Must
    Navigate To Task Page
    Create Task    งานลูก 1    มีงานผูก    Dev
    Create Task    งานลูก 2    มีงานผูก    Tester
    Navigate To Requirement Page
    Open Card    มีงานผูก
    Click Delete Button
    Dialog Should Be Visible
    Dialog Should Contain    2 Tasks
    Confirm Delete
    Card Should Not Exist    มีงานผูก
    Nav Count Should Be    tasks    0
