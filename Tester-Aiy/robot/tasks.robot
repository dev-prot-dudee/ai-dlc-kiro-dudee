*** Settings ***
Documentation    Automate Test — FR2: Task Management
...              ครอบคลุม FR2.1-FR2.7, FR4.5
...              ทดสอบทั้ง pass cases และ fail cases
Resource         ../keywords.resource
Suite Setup      Open PM Tool
Suite Teardown   Close PM Tool
Test Setup       Run Keywords    Clear Local Storage    Reload    Go To Requirements

*** Test Cases ***
# ==============================================================================
# FR2.1: สร้าง Task — PASS
# ==============================================================================

TC-T01: สร้าง Task สำเร็จเมื่อเลือก Requirement และตำแหน่ง
    [Documentation]    มี Requirement แล้ว → สร้าง Task ได้ → ปรากฏบน board
    [Tags]    FR2.1    pass    create
    Create Requirement    Req สำหรับ Task    Functional    Must
    Go To Tasks
    Create Task    สร้างหน้า Login    Dev
    Card Should Be Visible    สร้างหน้า Login

# ==============================================================================
# FR2.2: บังคับผูก Requirement — FAIL
# ==============================================================================

TC-T02: FAIL — สร้าง Task โดยไม่เลือก Requirement ต้องถูกปฏิเสธ
    [Documentation]    ไม่เลือก Requirement → เห็น error
    [Tags]    FR2.2    fail    validation
    Create Requirement    มี Req แล้ว    Functional    Must
    Go To Tasks
    Create Task Without Requirement    Task ลอย
    Should See Error Message

TC-T03: FAIL — ไม่มี Requirement ในระบบเลย → กดสร้าง Task ต้องเห็น alert
    [Documentation]    ระบบว่าง → กด New → แจ้งว่าสร้างไม่ได้
    [Tags]    FR2.2    fail    prerequisite
    Go To Tasks
    Click    [data-testid="toolbar-new"]
    Should See Text    ยังสร้าง Task ไม่ได้

# ==============================================================================
# FR2.3: บังคับระบุตำแหน่ง — FAIL
# ==============================================================================

TC-T04: FAIL — ไม่เลือกตำแหน่ง ต้องถูกปฏิเสธ
    [Documentation]    role ว่าง → เห็น error
    [Tags]    FR2.3    fail    validation
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="task-title"]    Task ไม่มี role
    ${value}=    Get Attribute    [data-testid="task-requirement"] >> option >> nth=1    value
    Select Options By    [data-testid="task-requirement"]    value    ${value}
    Select Options By    [data-testid="task-role"]    value    ${EMPTY}
    Click    [data-testid="form-submit"]
    Should See Error Message

# ==============================================================================
# FR2.4: กรองตามตำแหน่ง — PASS
# ==============================================================================

TC-T05: กรองตามตำแหน่ง Tester → เห็นเฉพาะ Task ของ Tester
    [Documentation]    List view → filter role = Tester
    [Tags]    FR2.4    pass    filter
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Create Task    งาน Dev    Dev
    Create Task    งาน Tester    Tester
    Switch To List View
    Select Options By    [data-testid="filter-role"]    value    Tester
    Should See Text    งาน Tester
    Should Not See Text    งาน Dev

# ==============================================================================
# FR2.5: แก้ไขและลบ — PASS
# ==============================================================================

TC-T06: แก้ไขหัวข้อ Task → เห็นค่าใหม่
    [Documentation]    edit → เปลี่ยน title → เห็นค่าใหม่
    [Tags]    FR2.5    pass    edit
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Create Task    ก่อนแก้ Task    Dev
    Open Card Detail    ก่อนแก้ Task
    Click Edit
    Fill Text    [data-testid="task-title"]    หลังแก้ Task
    Click    [data-testid="form-submit"]
    Card Should Be Visible    หลังแก้ Task

TC-T07: ลบ Task → หายจากรายการ
    [Documentation]    delete → confirm → หาย
    [Tags]    FR2.5    pass    delete
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Create Task    จะลบ Task    SA
    Open Card Detail    จะลบ Task
    Click Delete
    Confirm Delete
    Card Should Not Be Visible    จะลบ Task

# ==============================================================================
# FR2.5: ลบ — FAIL (ยกเลิก)
# ==============================================================================

TC-T08: FAIL — ลบ Task → ยกเลิก → ยังอยู่
    [Documentation]    delete → cancel → รายการยังอยู่
    [Tags]    FR2.5    fail    delete    cancel
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Create Task    อย่าลบ Task    Dev
    Open Card Detail    อย่าลบ Task
    Click Delete
    Cancel Delete
    Card Should Be Visible    อย่าลบ Task

# ==============================================================================
# FR4.5: Cascade delete Task → Defect หาย
# ==============================================================================

TC-T09: ลบ Task ที่มี Defect → ต้องเตือนจำนวนก่อนยืนยัน
    [Documentation]    Task มี Defect → dialog เตือนจำนวน Defect
    [Tags]    FR4.5    pass    cascade
    Create Requirement    Req    Functional    Must
    Go To Tasks
    Create Task    Task มี Defect    Dev
    Go To Defects
    Create Defect    Bug ที่ 1    Code Bug    High
    Go To Tasks
    Open Card Detail    Task มี Defect
    Click Delete
    Should See Dialog
    Should See Text    Defect
    Confirm Delete
    Card Should Not Be Visible    Task มี Defect
