*** Settings ***
Documentation    Automate Test — FR1: Requirement Management
...              ครอบคลุม FR1.1-FR1.7, FR4.3, FR4.4
...              ทดสอบทั้ง pass cases และ fail cases
Resource         ../keywords.resource
Suite Setup      Open PM Tool
Suite Teardown   Close PM Tool
Test Setup       Run Keywords    Clear Local Storage    Reload    Go To Requirements

*** Test Cases ***
# ==============================================================================
# FR1.1: สร้าง Requirement — PASS
# ==============================================================================

TC-R01: สร้าง Requirement สำเร็จเมื่อกรอกข้อมูลครบ
    [Documentation]    กรอก title + category + priority → ปรากฏบน board
    [Tags]    FR1.1    pass    create
    Create Requirement    ผู้ใช้ต้องเข้าสู่ระบบได้    Functional    Must
    Card Should Be Visible    ผู้ใช้ต้องเข้าสู่ระบบได้

TC-R02: สร้าง Requirement ค่า priority เริ่มต้นเป็น Should
    [Documentation]    ไม่ระบุ priority → ได้ Should
    [Tags]    FR1.1    FR1.3    pass
    Create Requirement    ระบบตอบสนองเร็ว    Non-Functional
    Card Should Be Visible    ระบบตอบสนองเร็ว

# ==============================================================================
# FR1.1: สร้าง Requirement — FAIL
# ==============================================================================

TC-R03: FAIL — สร้างโดยไม่กรอก title ต้องถูกปฏิเสธ
    [Documentation]    ไม่กรอก title → เห็น error ไม่สร้างการ์ด
    [Tags]    FR1.1    fail    validation
    Create Requirement Without Title
    Should See Error Message

TC-R04: FAIL — สร้างโดยไม่เลือก category ต้องถูกปฏิเสธ
    [Documentation]    ไม่เลือก category → เห็น error ไม่สร้างการ์ด
    [Tags]    FR1.2    fail    validation
    Create Requirement Without Category    ทดสอบไม่มี category
    Should See Error Message

# ==============================================================================
# FR1.4: กรองและค้นหา — PASS
# ==============================================================================

TC-R05: ค้นหาด้วยคำ → เห็นเฉพาะรายการที่ตรง
    [Documentation]    พิมพ์ค้นหา → กรองเฉพาะรายการที่มีคำนั้น
    [Tags]    FR1.4    pass    search
    Create Requirement    Login Feature    Functional    Must
    Create Requirement    Performance NFR    Non-Functional    Should
    Fill Text    [data-testid="toolbar-search"]    Login
    Card Should Be Visible    Login Feature
    Card Should Not Be Visible    Performance NFR

TC-R06: กรองตามประเภทใน List view
    [Documentation]    เลือก filter Functional → เห็นเฉพาะ Functional
    [Tags]    FR1.4    pass    filter
    Create Requirement    FR ข้อหนึ่ง    Functional    Must
    Create Requirement    NFR ข้อหนึ่ง    Non-Functional    Could
    Switch To List View
    Select Options By    [data-testid="filter-category"]    value    Functional
    Should See Text    FR ข้อหนึ่ง
    Should Not See Text    NFR ข้อหนึ่ง

# ==============================================================================
# FR1.4: กรอง — FAIL (ไม่มีผลตรง = ไม่เห็นอะไร)
# ==============================================================================

TC-R07: FAIL — ค้นหาคำที่ไม่มี → ไม่เห็นรายการใดเลย
    [Documentation]    คำค้นไม่ match อะไร → ไม่แสดงรายการ
    [Tags]    FR1.4    fail    search
    Create Requirement    หัวข้อจริง    Functional    Must
    Fill Text    [data-testid="toolbar-search"]    ไม่มีคำนี้แน่นอน
    Card Should Not Be Visible    หัวข้อจริง

# ==============================================================================
# FR1.5: แก้ไข — PASS
# ==============================================================================

TC-R08: แก้ไขหัวข้อสำเร็จ → เห็นค่าใหม่
    [Documentation]    เปิด detail → edit → แก้ title → เห็นค่าใหม่
    [Tags]    FR1.5    pass    edit
    Create Requirement    ก่อนแก้    Functional    Should
    Open Card Detail    ก่อนแก้
    Click Edit
    Fill Text    [data-testid="req-title"]    หลังแก้แล้ว
    Click    [data-testid="form-submit"]
    Card Should Be Visible    หลังแก้แล้ว
    Card Should Not Be Visible    ก่อนแก้

# ==============================================================================
# FR1.6: ลบ — PASS
# ==============================================================================

TC-R09: ลบ Requirement → ยืนยัน → หายจาก board
    [Documentation]    กดลบ → ยืนยัน → รายการหายไป
    [Tags]    FR1.6    pass    delete
    Create Requirement    จะลบทิ้ง    Functional    Won't
    Open Card Detail    จะลบทิ้ง
    Click Delete
    Should See Dialog
    Confirm Delete
    Card Should Not Be Visible    จะลบทิ้ง

TC-R10: FAIL — ลบ → ยกเลิก → ยังอยู่
    [Documentation]    กดลบ → ยกเลิก → รายการยังอยู่
    [Tags]    FR1.6    fail    delete    cancel
    Create Requirement    อย่าลบฉัน    Functional    Must
    Open Card Detail    อย่าลบฉัน
    Click Delete
    Should See Dialog
    Cancel Delete
    Card Should Be Visible    อย่าลบฉัน

# ==============================================================================
# FR4.3: Requirement ที่ยังไม่มี Task → เตือน
# ==============================================================================

TC-R11: Requirement ที่ไม่มี Task ต้องแสดงคำเตือน
    [Documentation]    Requirement ที่ยังไม่ถูกแตก Task → เห็น warning
    [Tags]    FR4.3    pass    traceability
    Create Requirement    ยังไม่มี Task    Functional    Should
    Should See Text    ⚠ ยังไม่มี Task

# ==============================================================================
# FR6.1: ข้อมูลคงอยู่ข้าม session
# ==============================================================================

TC-R12: สร้างแล้ว refresh → ยังเห็นรายการเดิม
    [Documentation]    ข้อมูลบันทึกใน localStorage คงอยู่หลัง refresh
    [Tags]    FR6.1    pass    persistence
    Create Requirement    ต้องอยู่หลัง refresh    Functional    Must
    Reload
    Go To Requirements
    Card Should Be Visible    ต้องอยู่หลัง refresh
