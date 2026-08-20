*** Settings ***
Documentation    Automate Test — FR4: Traceability + FR5: User + FR6: Storage
...              ทดสอบสายเชื่อมโยง, cascade delete, export/import, error boundary
Resource         ../keywords.resource
Suite Setup      Open PM Tool
Suite Teardown   Close PM Tool
Test Setup       Run Keywords    Clear Local Storage    Reload    Go To Requirements

*** Test Cases ***
# ==============================================================================
# FR4.1: สายเชื่อมโยงจาก Requirement ลง Task/Defect
# ==============================================================================

TC-TR01: เปิด Requirement → เห็น Task และ Defect ที่อยู่ใต้มัน
    [Documentation]    Forward trace: Requirement detail แสดง Task + Defect
    [Tags]    FR4.1    pass    traceability
    Create Requirement    ผู้ใช้ต้อง Login ได้    Functional    Must
    Go To Tasks
    Create Task    สร้าง Login API    Dev
    Go To Defects
    Create Defect    Login ไม่ hash password    Code Bug    Critical
    Go To Requirements
    Open Card Detail    ผู้ใช้ต้อง Login ได้
    Should See Text    สร้าง Login API
    Should See Text    Login ไม่ hash password

# ==============================================================================
# FR4.2: สายย้อนกลับจาก Defect ขึ้นไป Task/Requirement
# ==============================================================================

TC-TR02: เปิด Defect → เห็น Task ต้นทาง
    [Documentation]    Backward trace: Defect detail แสดง Task ต้นทาง
    [Tags]    FR4.2    pass    traceability
    Create Requirement    Req ต้นทาง    Functional    Must
    Go To Tasks
    Create Task    Task ต้นทาง    Dev
    Go To Defects
    Create Defect    ปัญหาที่พบ    SA Gap    High
    Open Card Detail    ปัญหาที่พบ
    Should See Text    Task ต้นทาง

# ==============================================================================
# FR4.3: Requirement ที่ยังไม่มี Task → เตือน
# ==============================================================================

TC-TR03: Requirement ที่ไม่มี Task → แสดงคำเตือน
    [Documentation]    Requirement ยังไม่ถูกแตก Task → เห็น ⚠
    [Tags]    FR4.3    pass    warning
    Create Requirement    ยังไม่แตก Task    Functional    Should
    Should See Text    ⚠ ยังไม่มี Task

# ==============================================================================
# FR4.4: Cascade delete Requirement
# ==============================================================================

TC-TR04: ลบ Requirement → Task และ Defect ใต้มันหายด้วย
    [Documentation]    Cascade: ลบ Req → Task + Defect หายหมด
    [Tags]    FR4.4    pass    cascade
    Create Requirement    Req จะลบ    Functional    Must
    Go To Tasks
    Create Task    Task ใต้ Req    Dev
    Go To Defects
    Create Defect    Defect ใต้ Task    Code Bug    High
    Go To Requirements
    Open Card Detail    Req จะลบ
    Click Delete
    Should See Dialog
    Should See Text    Task
    Confirm Delete
    Card Should Not Be Visible    Req จะลบ
    Go To Tasks
    Card Should Not Be Visible    Task ใต้ Req
    Go To Defects
    Card Should Not Be Visible    Defect ใต้ Task

# ==============================================================================
# FR5.3: จำผู้ใช้ข้าม session
# ==============================================================================

TC-TR05: เลือกผู้ใช้แล้ว refresh → ยังเป็นคนเดิม
    [Documentation]    FR5.3: localStorage จำผู้ใช้ไว้
    [Tags]    FR5.3    pass    user    persistence
    # เลือกผู้ใช้คนที่ 4 (index 3)
    Select Options By    [data-testid="user-picker"]    index    3
    ${before}=    Get Property    [data-testid="user-picker"]    value
    Reload
    ${after}=    Get Property    [data-testid="user-picker"]    value
    Should Be Equal    ${before}    ${after}

# ==============================================================================
# FR6.1: ข้อมูลคงอยู่ข้าม session
# ==============================================================================

TC-TR06: สร้างรายการ → refresh → ยังเห็นรายการเดิม
    [Documentation]    localStorage persist ข้าม refresh
    [Tags]    FR6.1    pass    persistence
    Create Requirement    ต้องอยู่หลัง refresh    Functional    Must
    Reload
    Go To Requirements
    Card Should Be Visible    ต้องอยู่หลัง refresh

# ==============================================================================
# FR6.3: ข้อมูลเสียหาย → Error Boundary (FAIL case)
# ==============================================================================

TC-TR07: FAIL — localStorage เสีย → แสดง error boundary ไม่ใช่จอขาว
    [Documentation]    เขียนข้อมูลผิดรูปแบบลง localStorage → เห็น error
    [Tags]    FR6.3    fail    error-boundary
    Evaluate JavaScript    ${None}    localStorage.setItem("pm-tool.requirements", "{ ไม่ใช่ JSON }")
    Reload
    Get Element States    [data-testid="error-boundary"]    contains    visible

# ==============================================================================
# FR6.2: Export / Import — PASS
# ==============================================================================

TC-TR08: Export แล้ว Import กลับ → ข้อมูลครบ
    [Documentation]    สร้าง → export → ล้าง → import → ยังเห็น
    [Tags]    FR6.2    pass    export    import
    Create Requirement    รายการสำหรับ export    Functional    Must
    # Export
    ${download_promise}=    Promise To Wait For Download
    Click    [data-testid="toolbar-export"]
    ${download}=    Wait For    ${download_promise}
    ${path}=    Download Save As    ${download}    /tmp/pm-export.json
    # ล้างข้อมูล
    Clear Local Storage
    Reload
    Go To Requirements
    Card Should Not Be Visible    รายการสำหรับ export
    # Import
    Upload File By Selector    input[type="file"]    /tmp/pm-export.json
    Card Should Be Visible    รายการสำหรับ export

# ==============================================================================
# FR6.2: Import ผิดรูปแบบ — FAIL
# ==============================================================================

TC-TR09: FAIL — Import ไฟล์ที่ไม่ใช่ JSON → แจ้ง error + ข้อมูลเดิมไม่หาย
    [Documentation]    import ข้อมูลผิด → alert + ข้อมูลเดิมยังอยู่
    [Tags]    FR6.2    fail    import
    Create Requirement    ข้อมูลเดิม    Functional    Must
    # สร้างไฟล์ผิดรูปแบบ
    Evaluate JavaScript    ${None}
    ...    const blob = new Blob(['ไม่ใช่ JSON'], {type: 'application/json'}); const f = new File([blob], 'bad.json'); const dt = new DataTransfer(); dt.items.add(f); document.querySelector('input[type="file"]').files = dt.files; document.querySelector('input[type="file"]').dispatchEvent(new Event('change', {bubbles: true}));
    Should See Text    ไม่สำเร็จ
    Card Should Be Visible    ข้อมูลเดิม
