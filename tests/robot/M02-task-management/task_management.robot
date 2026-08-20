*** Settings ***
Documentation    ทดสอบโมดูลจัดการ Task (M02)
...              ครอบคลุม FR2.1-FR2.7, FR4.5
Resource         ../robot_keywords.resource
Suite Setup      Open Application
Suite Teardown   Close Application

*** Keywords ***
Reset To Task Page
    [Documentation]    รีเซ็ตหน้าก่อนทุก test
    Go To    ${BASE_URL}/requirements
    Wait Until Element Is Visible    css:[data-testid="nav-requirements"]    timeout=5s

Setup Requirement For Task
    [Documentation]    สร้าง Requirement ก่อนเพื่อใช้ผูก Task
    [Arguments]    ${title}=Requirement สำหรับ Task
    Navigate To Requirement Page
    Create Requirement    ${title}    Functional    Must

*** Test Cases ***
# =============================================================================
# FR2.1: สร้าง Task ใหม่
# =============================================================================

สร้าง Task ใหม่ได้สำเร็จเมื่อกรอกข้อมูลครบถ้วน
    [Documentation]    ผู้ใช้สร้าง Task ใหม่ที่ผูกกับ Requirement ต้องปรากฏใน board
    [Tags]    FR2.1    M02    create    happy-path
    Reset To Task Page
    Setup Requirement For Task    ผู้ใช้ต้อง Login ได้
    Navigate To Task Page
    Create Task    สร้างหน้า Login    ผู้ใช้ต้อง Login ได้    Dev
    Card Should Be Visible    สร้างหน้า Login

# =============================================================================
# FR2.2: ต้องผูกกับ Requirement (ห้าม Task ลอย)
# =============================================================================

ไม่มี Requirement เลย กด New ต้องเตือน
    [Documentation]    เมื่อไม่มี Requirement ในระบบ กดสร้าง Task ต้องแสดงคำเตือน
    [Tags]    FR2.2    M02    requirement-link    validation
    Go To    ${BASE_URL}/tasks
    Wait Until Element Is Visible    css:[data-testid="nav-tasks"]    timeout=5s
    Click New Button
    Alert Should Contain    ยังสร้าง Task ไม่ได้

ไม่เลือก Requirement ระบบต้องปฏิเสธ
    [Documentation]    กรอกข้อมูลครบแต่ไม่เลือก Requirement → ระบบปฏิเสธ
    [Tags]    FR2.2    M02    requirement-link    validation
    Reset To Task Page
    Setup Requirement For Task    Requirement ที่มีอยู่
    Navigate To Task Page
    Click New Button
    Fill Task Title    งานลอย
    Select Task Role    Dev
    Submit Task Form
    Field Should Be Invalid    task-requirement

# =============================================================================
# FR2.3: บังคับระบุตำแหน่ง (SA/UX/Dev/Tester)
# =============================================================================

ไม่เลือกตำแหน่ง ระบบต้องปฏิเสธ
    [Documentation]    ไม่ระบุตำแหน่ง → ระบบปฏิเสธที่ช่องตำแหน่ง
    [Tags]    FR2.3    M02    role    validation
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Click New Button
    Fill Task Title    งานไร้ตำแหน่ง
    Select Task Requirement    ต้นทาง
    Submit Task Form
    Field Should Be Invalid    task-role

กดเพิ่มจากหัว Column ต้องตั้งตำแหน่งไว้ล่วงหน้า
    [Documentation]    กด + ที่หัว column Tester → ฟอร์มมีค่า Tester อยู่แล้ว
    [Tags]    FR2.3    M02    role    column-add
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Create Task    งานแรก    ต้นทาง    Dev
    Click Element    css:[data-testid="board-Tester-add"]
    ${value}=    Get Value    css:[data-testid="task-role"]
    Should Be Equal    ${value}    Tester

# =============================================================================
# FR2.4: กรอง 3 เงื่อนไข (ตำแหน่ง, ผู้รับผิดชอบ, Requirement)
# =============================================================================

กรองตามตำแหน่งต้องแสดงเฉพาะ Role ที่เลือก
    [Documentation]    เลือก filter ตำแหน่ง Tester → แสดงเฉพาะ Task ของ Tester
    [Tags]    FR2.4    M02    filter    role
    Reset To Task Page
    Navigate To Requirement Page
    Create Requirement    Req A    Functional    Must
    Create Requirement    Req B    Functional    Should
    Navigate To Task Page
    Create Task    งาน Dev    Req A    Dev
    Create Task    งาน Tester    Req B    Tester
    Switch To List View
    Select From List By Value    css:[data-testid="filter-role"]    Tester
    Page Should Contain    งาน Tester
    Page Should Not Contain    งาน Dev

กรองตาม Requirement ต้นทาง
    [Documentation]    เลือก filter Requirement → แสดงเฉพาะ Task ของ Requirement นั้น
    [Tags]    FR2.4    M02    filter    requirement
    Reset To Task Page
    Navigate To Requirement Page
    Create Requirement    Req X    Functional    Must
    Create Requirement    Req Y    Functional    Should
    Navigate To Task Page
    Create Task    งานของ X    Req X    Dev
    Create Task    งานของ Y    Req Y    Dev
    Switch To List View
    Select From List By Label    css:[data-testid="filter-requirement"]    Req X
    Page Should Contain    งานของ X
    Page Should Not Contain    งานของ Y

# =============================================================================
# FR2.5: แก้ไขและลบ
# =============================================================================

แก้ไข Task เปลี่ยนตำแหน่ง การ์ดต้องย้าย Column
    [Documentation]    เปลี่ยน role จาก Dev → SA → การ์ดย้ายไป column SA
    [Tags]    FR2.5    M02    edit
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Create Task    ย้ายฉัน    ต้นทาง    Dev
    Open Card    ย้ายฉัน
    Click Edit Button
    Select Task Role    SA
    Submit Task Form
    Sleep    1s
    Navigate To Task Page
    Card Should Be Visible    ย้ายฉัน

ลบ Task ยืนยันแล้วหายจาก Board
    [Documentation]    กดลบ → ยืนยัน → หายจาก board
    [Tags]    FR2.5    M02    delete
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Create Task    ลบฉัน    ต้นทาง    Dev
    Open Card    ลบฉัน
    Click Delete Button
    Dialog Should Be Visible
    Confirm Delete
    Card Should Not Exist    ลบฉัน

# =============================================================================
# FR2.6: แสดง Requirement ต้นทาง
# =============================================================================

รายละเอียด Task ต้องแสดง Requirement ต้นทาง
    [Documentation]    เปิดดู Task → เห็นชื่อ Requirement ต้นทาง
    [Tags]    FR2.6    M02    traceability
    Reset To Task Page
    Setup Requirement For Task    ผู้ใช้ต้องออกรายงานได้
    Navigate To Task Page
    Create Task    ทำหน้ารายงาน    ผู้ใช้ต้องออกรายงานได้    Dev
    Open Card    ทำหน้ารายงาน
    Page Should Contain    Requirement ต้นทาง
    Page Should Contain    ผู้ใช้ต้องออกรายงานได้

# =============================================================================
# FR2.7 + FR4.5: นับ Defect และ Cascade Delete
# =============================================================================

การ์ด Task ต้องแสดงจำนวน Defect
    [Documentation]    Task ที่มี Defect ผูกอยู่ → การ์ดแสดง "2 Defects"
    [Tags]    FR2.7    M02    defect-count
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Create Task    งานมีปัญหา    ต้นทาง    Dev
    Navigate To Defect Page
    Create Defect    ปัญหา 1    งานมีปัญหา    Code Bug    Medium
    Create Defect    ปัญหา 2    งานมีปัญหา    SA Gap    High
    Navigate To Task Page
    Page Should Contain    2 Defects

ลบ Task ที่มี Defect ต้องเตือนจำนวนก่อน
    [Documentation]    Task มี Defect ผูก → dialog บอกจำนวน Defect ที่จะถูกลบตาม
    [Tags]    FR4.5    M02    cascade    delete
    Reset To Task Page
    Setup Requirement For Task    ต้นทาง
    Navigate To Task Page
    Create Task    งานจะลบ    ต้นทาง    Dev
    Navigate To Defect Page
    Create Defect    Defect A    งานจะลบ    Code Bug    Low
    Create Defect    Defect B    งานจะลบ    Code Bug    Low
    Navigate To Task Page
    Open Card    งานจะลบ
    Click Delete Button
    Dialog Should Be Visible
    Dialog Should Contain    2 Defects
    Confirm Delete
    Card Should Not Exist    งานจะลบ
    Nav Count Should Be    defects    0
