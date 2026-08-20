*** Settings ***
Documentation    Automate Test — FR3: Defect Tracking
...              ครอบคลุม FR3.1-FR3.7
...              ทดสอบทั้ง pass cases และ fail cases
Resource         ../keywords.resource
Suite Setup      Open PM Tool
Suite Teardown   Close PM Tool
Test Setup       Run Keywords    Clear Local Storage    Reload    Go To Requirements

*** Keywords ***
Seed Requirement And Task
    [Documentation]    สร้าง Requirement + Task เตรียมให้ Defect มี Task ผูก
    Create Requirement    Req ต้นทาง    Functional    Must
    Go To Tasks
    Create Task    Task ต้นทาง    Dev
    Go To Defects

*** Test Cases ***
# ==============================================================================
# FR3.1: สร้าง Defect — PASS
# ==============================================================================

TC-D01: สร้าง Defect สำเร็จเมื่อเลือก Task และระบุครบ
    [Documentation]    เลือก Task + type + severity → ปรากฏบน board
    [Tags]    FR3.1    pass    create
    Seed Requirement And Task
    Create Defect    ปุ่ม Login พัง    Code Bug    High
    Card Should Be Visible    ปุ่ม Login พัง

# ==============================================================================
# FR3.2: บังคับระบุประเภทจาก 5 ค่า — PASS
# ==============================================================================

TC-D02: สร้าง Defect ทั้ง 5 ประเภทได้
    [Documentation]    ทุกประเภทบันทึกสำเร็จ
    [Tags]    FR3.2    pass    create
    Seed Requirement And Task
    Create Defect    Bug 1    Code Bug    Medium
    Create Defect    SA 1    SA Gap    Medium
    Create Defect    Design 1    Design Gap    Low
    Create Defect    Test 1    Test Escape    High
    Create Defect    NFR 1    NFR Violation    Critical
    Card Should Be Visible    Bug 1
    Card Should Be Visible    SA 1
    Card Should Be Visible    Design 1
    Card Should Be Visible    Test 1
    Card Should Be Visible    NFR 1

# ==============================================================================
# FR3.2: บังคับระบุประเภท — FAIL
# ==============================================================================

TC-D03: FAIL — ไม่เลือกประเภท Defect ต้องถูกปฏิเสธ
    [Documentation]    type ว่าง → เห็น error
    [Tags]    FR3.2    fail    validation
    Seed Requirement And Task
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="defect-title"]    ไม่มีประเภท
    Select Options By    [data-testid="defect-type"]    value    ${EMPTY}
    Select Options By    [data-testid="defect-severity"]    value    Medium
    ${value}=    Get Attribute    [data-testid="defect-task"] >> option >> nth=1    value
    Select Options By    [data-testid="defect-task"]    value    ${value}
    Click    [data-testid="form-submit"]
    Should See Error Message

# ==============================================================================
# FR3.3: บังคับระบุความรุนแรง — FAIL
# ==============================================================================

TC-D04: FAIL — ไม่เลือก severity ต้องถูกปฏิเสธ
    [Documentation]    severity ว่าง → เห็น error
    [Tags]    FR3.3    fail    validation
    Seed Requirement And Task
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="defect-title"]    ไม่มี severity
    Select Options By    [data-testid="defect-type"]    value    Code Bug
    Select Options By    [data-testid="defect-severity"]    value    ${EMPTY}
    ${value}=    Get Attribute    [data-testid="defect-task"] >> option >> nth=1    value
    Select Options By    [data-testid="defect-task"]    value    ${value}
    Click    [data-testid="form-submit"]
    Should See Error Message

# ==============================================================================
# FR3.4: บังคับผูกกับ Task — FAIL
# ==============================================================================

TC-D05: FAIL — ไม่เลือก Task ต้องถูกปฏิเสธ
    [Documentation]    task ว่าง → เห็น error
    [Tags]    FR3.4    fail    validation
    Seed Requirement And Task
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="defect-title"]    Defect ลอย
    Select Options By    [data-testid="defect-type"]    value    SA Gap
    Select Options By    [data-testid="defect-severity"]    value    High
    # ไม่เลือก Task
    Click    [data-testid="form-submit"]
    Should See Error Message

TC-D06: FAIL — ไม่มี Task ในระบบเลย → กดสร้าง Defect ต้องเห็น alert
    [Documentation]    ระบบว่าง → กด New → แจ้งว่าสร้างไม่ได้
    [Tags]    FR3.4    fail    prerequisite
    Go To Defects
    Click    [data-testid="toolbar-new"]
    Should See Text    ยังสร้าง Defect ไม่ได้

# ==============================================================================
# FR3.5: กรอง — PASS
# ==============================================================================

TC-D07: กรองตามประเภท SA Gap → เห็นเฉพาะ SA Gap
    [Documentation]    List view → filter type = SA Gap
    [Tags]    FR3.5    pass    filter
    Seed Requirement And Task
    Create Defect    Bug ข้อหนึ่ง    Code Bug    High
    Create Defect    SA ไม่ครบ    SA Gap    Medium
    Switch To List View
    Select Options By    [data-testid="filter-type"]    value    SA Gap
    Should See Text    SA ไม่ครบ
    Should Not See Text    Bug ข้อหนึ่ง

# ==============================================================================
# FR3.6: แก้ไขและลบ — PASS + FAIL
# ==============================================================================

TC-D08: แก้ประเภท Defect → เห็นค่าใหม่
    [Documentation]    edit type → เห็นประเภทใหม่
    [Tags]    FR3.6    pass    edit
    Seed Requirement And Task
    Create Defect    จะแก้ Defect    Code Bug    Low
    Open Card Detail    จะแก้ Defect
    Click Edit
    Select Options By    [data-testid="defect-type"]    value    Design Gap
    Click    [data-testid="form-submit"]
    Card Should Be Visible    จะแก้ Defect

TC-D09: ลบ Defect → หายจาก board
    [Documentation]    delete → confirm → หาย
    [Tags]    FR3.6    pass    delete
    Seed Requirement And Task
    Create Defect    จะลบ Defect    Test Escape    Critical
    Open Card Detail    จะลบ Defect
    Click Delete
    Confirm Delete
    Card Should Not Be Visible    จะลบ Defect

TC-D10: FAIL — ลบ Defect → ยกเลิก → ยังอยู่
    [Documentation]    delete → cancel → รายการยังอยู่
    [Tags]    FR3.6    fail    delete    cancel
    Seed Requirement And Task
    Create Defect    อย่าลบ Defect    NFR Violation    Low
    Open Card Detail    อย่าลบ Defect
    Click Delete
    Cancel Delete
    Card Should Be Visible    อย่าลบ Defect

# ==============================================================================
# FR3.7: นับแยกตามประเภท — PASS
# ==============================================================================

TC-D11: Board แสดง column ครบ 5 ประเภท พร้อมตัวเลขนับ
    [Documentation]    สร้าง 2 Code Bug + 1 SA Gap → นับถูก ประเภทที่ไม่มีแสดง 0
    [Tags]    FR3.7    pass    count
    Seed Requirement And Task
    Create Defect    Bug A    Code Bug    High
    Create Defect    Bug B    Code Bug    Medium
    Create Defect    SA C    SA Gap    Low
    # ต้องเห็น column ทั้ง 5 ประเภท
    Should See Text    Code Bug
    Should See Text    SA Gap
    Should See Text    Design Gap
    Should See Text    Test Escape
    Should See Text    NFR Violation
