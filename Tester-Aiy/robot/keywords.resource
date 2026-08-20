*** Settings ***
Library    Browser

*** Variables ***
${BASE_URL}        http://localhost:5173
${BROWSER}         chromium
${HEADLESS}        true

*** Keywords ***
# ==============================================================================
# Setup / Teardown
# ==============================================================================

Open PM Tool
    [Documentation]    เปิดแอป PM Tool ในเบราว์เซอร์ ล้าง localStorage ให้เริ่มสด
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Page    ${BASE_URL}
    Clear Local Storage
    Reload

Close PM Tool
    [Documentation]    ปิดเบราว์เซอร์
    Close Browser

Clear Local Storage
    [Documentation]    ล้างข้อมูลทั้งหมดใน localStorage
    Evaluate JavaScript    ${None}    localStorage.clear()

# ==============================================================================
# Navigation
# ==============================================================================

Go To Requirements
    [Documentation]    คลิกเมนูไปหน้า Requirements
    Click    text=Requirements

Go To Tasks
    [Documentation]    คลิกเมนูไปหน้า Tasks
    Click    text=Tasks

Go To Defects
    [Documentation]    คลิกเมนูไปหน้า Defects
    Click    text=Defects

Switch To List View
    [Documentation]    สลับไปมุมมองตาราง
    Click    role=tab[name=/list/i]

Switch To Board View
    [Documentation]    สลับไปมุมมอง Board
    Click    role=tab[name=/board/i]

# ==============================================================================
# Requirement Actions
# ==============================================================================

Create Requirement
    [Documentation]    สร้าง Requirement ใหม่
    [Arguments]    ${title}    ${category}=Functional    ${priority}=Should
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="req-title"]    ${title}
    Select Options By    [data-testid="req-category"]    value    ${category}
    Select Options By    [data-testid="req-priority"]    value    ${priority}
    Click    [data-testid="form-submit"]
    Get Text    body    contains    ${title}

Create Requirement Without Category
    [Documentation]    พยายามสร้าง Requirement โดยไม่เลือก category (expect fail)
    [Arguments]    ${title}
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="req-title"]    ${title}
    Select Options By    [data-testid="req-category"]    value    ${EMPTY}
    Click    [data-testid="form-submit"]

Create Requirement Without Title
    [Documentation]    พยายามสร้าง Requirement โดยไม่กรอก title (expect fail)
    Click    [data-testid="toolbar-new"]
    Select Options By    [data-testid="req-category"]    value    Functional
    Click    [data-testid="form-submit"]

# ==============================================================================
# Task Actions
# ==============================================================================

Create Task
    [Documentation]    สร้าง Task ใหม่
    [Arguments]    ${title}    ${role}=Dev
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="task-title"]    ${title}
    Select Options By    [data-testid="task-role"]    value    ${role}
    # เลือก Requirement แรกที่มี
    ${options}=    Get Elements    [data-testid="task-requirement"] >> option
    ${count}=    Get Length    ${options}
    IF    ${count} > 1
        ${value}=    Get Attribute    [data-testid="task-requirement"] >> option >> nth=1    value
        Select Options By    [data-testid="task-requirement"]    value    ${value}
    END
    Click    [data-testid="form-submit"]
    Get Text    body    contains    ${title}

Create Task Without Requirement
    [Documentation]    พยายามสร้าง Task โดยไม่เลือก Requirement (expect fail)
    [Arguments]    ${title}
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="task-title"]    ${title}
    Select Options By    [data-testid="task-role"]    value    Dev
    Click    [data-testid="form-submit"]

# ==============================================================================
# Defect Actions
# ==============================================================================

Create Defect
    [Documentation]    สร้าง Defect ใหม่
    [Arguments]    ${title}    ${type}=Code Bug    ${severity}=Medium
    Click    [data-testid="toolbar-new"]
    Fill Text    [data-testid="defect-title"]    ${title}
    Select Options By    [data-testid="defect-type"]    value    ${type}
    Select Options By    [data-testid="defect-severity"]    value    ${severity}
    # เลือก Task แรกที่มี
    ${options}=    Get Elements    [data-testid="defect-task"] >> option
    ${count}=    Get Length    ${options}
    IF    ${count} > 1
        ${value}=    Get Attribute    [data-testid="defect-task"] >> option >> nth=1    value
        Select Options By    [data-testid="defect-task"]    value    ${value}
    END
    Click    [data-testid="form-submit"]
    Get Text    body    contains    ${title}

# ==============================================================================
# Detail & Edit & Delete
# ==============================================================================

Open Card Detail
    [Documentation]    เปิดรายละเอียดจากการ์ดที่มีชื่อตรง
    [Arguments]    ${title}
    Click    text=${title}

Click Edit
    [Documentation]    กดปุ่มแก้ไขในหน้ารายละเอียด
    Click    [data-testid="detail-edit"]

Click Delete
    [Documentation]    กดปุ่มลบในหน้ารายละเอียด
    Click    [data-testid="detail-delete"]

Confirm Delete
    [Documentation]    ยืนยันลบในกล่อง dialog
    Click    [data-testid="confirm-ok"]

Cancel Delete
    [Documentation]    ยกเลิกลบในกล่อง dialog
    Click    [data-testid="confirm-cancel"]

# ==============================================================================
# Assertions
# ==============================================================================

Should See Text
    [Documentation]    ตรวจว่าเห็นข้อความบนหน้า
    [Arguments]    ${text}
    Get Text    body    contains    ${text}

Should Not See Text
    [Documentation]    ตรวจว่าไม่เห็นข้อความบนหน้า
    [Arguments]    ${text}
    Get Text    body    not contains    ${text}

Should See Error Message
    [Documentation]    ตรวจว่ามี field error แสดงอยู่
    Get Element States    [data-testid="field-error"]    contains    visible

Should See Dialog
    [Documentation]    ตรวจว่ากล่อง dialog แสดงอยู่
    Get Element States    role=dialog    contains    visible

Card Should Be Visible
    [Documentation]    ตรวจว่าเห็นการ์ดที่มีชื่อตรง
    [Arguments]    ${title}
    Get Text    body    contains    ${title}

Card Should Not Be Visible
    [Documentation]    ตรวจว่าไม่เห็นการ์ดที่มีชื่อตรง
    [Arguments]    ${title}
    Get Text    body    not contains    ${title}
