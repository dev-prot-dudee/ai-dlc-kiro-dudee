*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BASE_URL}    http://localhost:5173
${BROWSER}     chrome

*** Keywords ***
Open Application
    [Documentation]    เปิดแอปพลิเคชันในเบราว์เซอร์
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    css:[data-testid="nav-requirements"]    timeout=10s

Close Application
    [Documentation]    ปิดเบราว์เซอร์
    Close All Browsers

Navigate To Requirement Page
    [Documentation]    ไปยังหน้าจัดการ Requirement
    Click Element    css:[data-testid="nav-requirements"]
    Wait Until Element Is Visible    css:h1

Navigate To Task Page
    [Documentation]    ไปยังหน้าจัดการ Task
    Click Element    css:[data-testid="nav-tasks"]
    Wait Until Element Is Visible    css:h1

Navigate To Defect Page
    [Documentation]    ไปยังหน้าจัดการ Defect
    Click Element    css:[data-testid="nav-defects"]
    Wait Until Element Is Visible    css:h1

Click New Button
    [Documentation]    คลิกปุ่มสร้างรายการใหม่
    Click Element    css:[data-testid="toolbar-new"]

Switch To List View
    [Documentation]    สลับไปมุมมองตาราง
    Click Element    css:[data-testid="view-tab-list"]

# ===== Requirement Form =====
Fill Requirement Title
    [Documentation]    กรอกหัวข้อ Requirement
    [Arguments]    ${title}
    Input Text    css:[data-testid="req-title"]    ${title}

Select Requirement Category
    [Documentation]    เลือกประเภท Requirement
    [Arguments]    ${category}
    Select From List By Value    css:[data-testid="req-category"]    ${category}

Select Requirement Priority
    [Documentation]    เลือกระดับความสำคัญ
    [Arguments]    ${priority}
    Select From List By Value    css:[data-testid="req-priority"]    ${priority}

Submit Requirement Form
    [Documentation]    กดบันทึก Requirement
    Click Element    css:[data-testid="req-submit"]

Create Requirement
    [Documentation]    สร้าง Requirement ครบวงจร
    [Arguments]    ${title}    ${category}=Functional    ${priority}=Should
    Click New Button
    Fill Requirement Title    ${title}
    Select Requirement Category    ${category}
    Select Requirement Priority    ${priority}
    Submit Requirement Form
    Wait Until Element Is Visible    css:.board-card__title    timeout=5s

# ===== Task Form =====
Fill Task Title
    [Documentation]    กรอกหัวข้อ Task
    [Arguments]    ${title}
    Input Text    css:[data-testid="task-title"]    ${title}

Select Task Requirement
    [Documentation]    เลือก Requirement ต้นทาง (เลือกจากข้อความที่เห็น)
    [Arguments]    ${requirement_text}
    ${options}=    Get WebElements    css:[data-testid="task-requirement"] option
    FOR    ${option}    IN    @{options}
        ${text}=    Get Text    ${option}
        ${contains}=    Run Keyword And Return Status    Should Contain    ${text}    ${requirement_text}
        IF    ${contains}
            ${value}=    Get Element Attribute    ${option}    value
            Select From List By Value    css:[data-testid="task-requirement"]    ${value}
            RETURN
        END
    END
    Fail    ไม่พบตัวเลือก "${requirement_text}" ใน dropdown

Select Task Role
    [Documentation]    เลือกตำแหน่งผู้รับผิดชอบ
    [Arguments]    ${role}
    Select From List By Value    css:[data-testid="task-role"]    ${role}

Submit Task Form
    [Documentation]    กดบันทึก Task
    Click Element    css:[data-testid="task-submit"]

Create Task
    [Documentation]    สร้าง Task ครบวงจร
    [Arguments]    ${title}    ${requirement_text}    ${role}=Dev
    Click New Button
    Fill Task Title    ${title}
    Select Task Requirement    ${requirement_text}
    Select Task Role    ${role}
    Submit Task Form
    Wait Until Element Is Visible    css:.board-card__title    timeout=5s

# ===== Defect Form =====
Fill Defect Title
    [Documentation]    กรอกหัวข้อ Defect
    [Arguments]    ${title}
    Input Text    css:[data-testid="defect-title"]    ${title}

Select Defect Task
    [Documentation]    เลือก Task ต้นทาง (เลือกจากข้อความที่เห็น)
    [Arguments]    ${task_text}
    ${options}=    Get WebElements    css:[data-testid="defect-task"] option
    FOR    ${option}    IN    @{options}
        ${text}=    Get Text    ${option}
        ${contains}=    Run Keyword And Return Status    Should Contain    ${text}    ${task_text}
        IF    ${contains}
            ${value}=    Get Element Attribute    ${option}    value
            Select From List By Value    css:[data-testid="defect-task"]    ${value}
            RETURN
        END
    END
    Fail    ไม่พบตัวเลือก "${task_text}" ใน dropdown

Select Defect Type
    [Documentation]    เลือกประเภท Defect
    [Arguments]    ${type}
    Select From List By Value    css:[data-testid="defect-type"]    ${type}

Select Defect Severity
    [Documentation]    เลือกความรุนแรง
    [Arguments]    ${severity}
    Select From List By Value    css:[data-testid="defect-severity"]    ${severity}

Submit Defect Form
    [Documentation]    กดบันทึก Defect
    Click Element    css:[data-testid="defect-submit"]

Create Defect
    [Documentation]    สร้าง Defect ครบวงจร
    [Arguments]    ${title}    ${task_text}    ${type}=Code Bug    ${severity}=Medium
    Click New Button
    Fill Defect Title    ${title}
    Select Defect Task    ${task_text}
    Select Defect Type    ${type}
    Select Defect Severity    ${severity}
    Submit Defect Form
    Wait Until Element Is Visible    css:.board-card__title    timeout=5s

# ===== Detail & Actions =====
Open Card
    [Documentation]    เปิดรายละเอียดของการ์ด
    [Arguments]    ${title}
    Click Element    xpath://span[contains(@class,'board-card__title') and text()='${title}']

Click Edit Button
    [Documentation]    คลิกปุ่มแก้ไข
    Click Element    css:[data-testid="detail-edit"]

Click Delete Button
    [Documentation]    คลิกปุ่มลบ
    Click Element    css:[data-testid="detail-delete"]

Confirm Delete
    [Documentation]    ยืนยันการลบ
    Click Element    css:[data-testid="confirm-ok"]

Cancel Delete
    [Documentation]    ยกเลิกการลบ
    Click Element    css:[data-testid="confirm-cancel"]

# ===== Assertions =====
Card Should Be Visible
    [Documentation]    ตรวจสอบว่าการ์ดแสดงอยู่
    [Arguments]    ${title}
    Wait Until Element Is Visible    xpath://span[contains(@class,'board-card__title') and text()='${title}']    timeout=5s

Card Should Not Exist
    [Documentation]    ตรวจสอบว่าการ์ดไม่มีอยู่
    [Arguments]    ${title}
    Page Should Not Contain Element    xpath://span[contains(@class,'board-card__title') and text()='${title}']

Alert Should Contain
    [Documentation]    ตรวจสอบข้อความใน alert
    [Arguments]    ${text}
    Wait Until Element Is Visible    css:[role="alert"]    timeout=5s
    Element Should Contain    css:[role="alert"]    ${text}

Nav Count Should Be
    [Documentation]    ตรวจสอบตัวเลขนับในเมนูซ้าย
    [Arguments]    ${module}    ${count}
    Element Should Contain    css:[data-testid="nav-${module}"] .sidebar__count    ${count}

Field Should Be Invalid
    [Documentation]    ตรวจสอบว่า field มี aria-invalid
    [Arguments]    ${testid}
    Element Attribute Value Should Be    css:[data-testid="${testid}"]    aria-invalid    true

Dialog Should Be Visible
    [Documentation]    ตรวจสอบว่า dialog ยืนยันแสดงอยู่
    Wait Until Element Is Visible    css:[role="dialog"]    timeout=5s

Dialog Should Contain
    [Documentation]    ตรวจสอบข้อความใน dialog
    [Arguments]    ${text}
    Element Should Contain    css:[role="dialog"]    ${text}
