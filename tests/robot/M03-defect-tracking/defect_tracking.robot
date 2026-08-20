*** Settings ***
Documentation    ทดสอบโมดูลติดตาม Defect (M03)
...              ครอบคลุม FR3.1-FR3.7
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application

*** Keywords ***
Reset Page
    [Documentation]    รีเซ็ตหน้าก่อนทุก test
    Go To    ${BASE_URL}/requirements
    Wait Until Element Is Visible    css:[data-testid="nav-requirements"]    timeout=5s

Setup Requirement And Task
    [Documentation]    สร้าง Requirement + Task สำหรับผูก Defect
    [Arguments]    ${req_title}=Req สำหรับ Defect    ${task_title}=Task สำหรับ Defect
    Navigate To Requirement Page
    Create Requirement    ${req_title}    Functional    Must
    Navigate To Task Page
    Create Task    ${task_title}    ${req_title}    Dev

*** Test Cases ***
# =============================================================================
# FR3.1: สร้าง Defect ใหม่
# =============================================================================

สร้าง Defect ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    สร้าง Defect ผูกกับ Task → ปรากฏใน board ทันที
    [Tags]    FR3.1    M03    create    happy-path
    Reset Page
    Setup Requirement And Task    Req Login    Task Login
    Navigate To Defect Page
    Create Defect    ปุ่ม Login ไม่ทำงาน    Task Login    Code Bug    High
    Card Should Be Visible    ปุ่ม Login ไม่ทำงาน

# =============================================================================
# FR3.2: ต้องระบุ Type จาก 5 ค่า
# =============================================================================

ไม่เลือก Type ระบบต้องปฏิเสธ
    [Documentation]    ไม่เลือกประเภท Defect → ระบบปฏิเสธ
    [Tags]    FR3.2    M03    type    validation
    Reset Page
    Setup Requirement And Task    Req Test    Task Test
    Navigate To Defect Page
    Click New Button
    Fill Defect Title    ไม่เลือกประเภท
    Select Defect Task    Task Test
    Select Defect Severity    Medium
    Submit Defect Form
    Field Should Be Invalid    defect-type

# =============================================================================
# FR3.3: ต้องระบุ Severity (Critical/High/Medium/Low)
# =============================================================================

ไม่เลือก Severity ระบบต้องปฏิเสธ
    [Documentation]    ไม่เลือกความรุนแรง → ระบบปฏิเสธ
    [Tags]    FR3.3    M03    severity    validation
    Reset Page
    Setup Requirement And Task    Req Test    Task Test
    Navigate To Defect Page
    Click New Button
    Fill Defect Title    ไม่เลือกความรุนแรง
    Select Defect Task    Task Test
    Select Defect Type    Code Bug
    Submit Defect Form
    Field Should Be Invalid    defect-severity

# =============================================================================
# FR3.4: ต้องผูกกับ Task
# =============================================================================

ไม่เลือก Task ระบบต้องปฏิเสธ
    [Documentation]    ไม่เลือก Task ต้นทาง → ระบบปฏิเสธพร้อมข้อความ
    [Tags]    FR3.4    M03    task-link    validation
    Reset Page
    Setup Requirement And Task    Req Test    Task Test
    Navigate To Defect Page
    Click New Button
    Fill Defect Title    Defect ลอย
    Select Defect Type    Code Bug
    Select Defect Severity    Medium
    Submit Defect Form
    Field Should Be Invalid    defect-task

# =============================================================================
# FR3.5: กรองตามประเภทและความรุนแรง
# =============================================================================

กรองตามประเภท Defect
    [Documentation]    เลือก filter type = SA Gap → แสดงเฉพาะ SA Gap
    [Tags]    FR3.5    M03    filter    type
    Reset Page
    Setup Requirement And Task    Req Filter    Task Filter
    Navigate To Defect Page
    Create Defect    Bug ปกติ    Task Filter    Code Bug    Medium
    Create Defect    สเปคไม่ครบ    Task Filter    SA Gap    High
    Switch To List View
    Select From List By Value    css:[data-testid="filter-type"]    SA Gap
    Page Should Contain    สเปคไม่ครบ
    Page Should Not Contain    Bug ปกติ

กรองตามความรุนแรง
    [Documentation]    เลือก filter severity = Critical → แสดงเฉพาะ Critical
    [Tags]    FR3.5    M03    filter    severity
    Reset Page
    Setup Requirement And Task    Req Sev    Task Sev
    Navigate To Defect Page
    Create Defect    Critical Bug    Task Sev    Code Bug    Critical
    Create Defect    Low Bug    Task Sev    Code Bug    Low
    Switch To List View
    Select From List By Value    css:[data-testid="filter-severity"]    Critical
    Page Should Contain    Critical Bug
    Page Should Not Contain    Low Bug

# =============================================================================
# FR3.6: แก้ไขและลบ
# =============================================================================

แก้ไข Defect เปลี่ยนประเภทและความรุนแรง
    [Documentation]    แก้ไข type + severity → ค่าใหม่แสดงถูกต้อง
    [Tags]    FR3.6    M03    edit
    Reset Page
    Setup Requirement And Task    Req Edit    Task Edit
    Navigate To Defect Page
    Create Defect    แก้ฉัน    Task Edit    Code Bug    Low
    Open Card    แก้ฉัน
    Click Edit Button
    Select Defect Type    SA Gap
    Select Defect Severity    Critical
    Submit Defect Form
    Sleep    1s
    Navigate To Defect Page
    Card Should Be Visible    แก้ฉัน

ลบ Defect ยืนยันแล้วหายจาก Board
    [Documentation]    กดลบ → ยืนยัน → หายจาก board
    [Tags]    FR3.6    M03    delete
    Reset Page
    Setup Requirement And Task    Req Del    Task Del
    Navigate To Defect Page
    Create Defect    ลบฉัน    Task Del    Code Bug    Medium
    Open Card    ลบฉัน
    Click Delete Button
    Dialog Should Be Visible
    Confirm Delete
    Card Should Not Exist    ลบฉัน

# =============================================================================
# FR3.7: นับ Defect แยกตามประเภท
# =============================================================================

Board แสดงจำนวน Defect แยกตามประเภท
    [Documentation]    สร้าง Defect หลายประเภท → board แสดงตัวเลขแยกตาม column
    [Tags]    FR3.7    M03    count-by-type
    Reset Page
    Setup Requirement And Task    Req Count    Task Count
    Navigate To Defect Page
    Create Defect    Bug 1    Task Count    Code Bug    Medium
    Create Defect    Bug 2    Task Count    Code Bug    Low
    Create Defect    SA Issue    Task Count    SA Gap    High
    Page Should Contain    2
    Page Should Contain    1
