*** Settings ***
Library    Browser

*** Variables ***
${BASE_URL}    http://localhost:5173
${BROWSER}     chromium

*** Keywords ***
Open Application
    [Documentation]    เปิดแอปพลิเคชันในเบราว์เซอร์
    New Browser    ${BROWSER}    headless=true
    New Page    ${BASE_URL}

Close Application
    [Documentation]    ปิดเบราว์เซอร์
    Close Browser

Navigate To Requirement Page
    [Documentation]    ไปยังหน้าจัดการ Requirement
    Click    text=Requirement

Navigate To Task Page
    [Documentation]    ไปยังหน้าจัดการ Task
    Click    text=Task

Navigate To Defect Page
    [Documentation]    ไปยังหน้าจัดการ Defect
    Click    text=Defect

Click Create Button
    [Documentation]    คลิกปุ่มสร้างรายการใหม่
    Click    button >> text=Create

Click Save Button
    [Documentation]    คลิกปุ่มบันทึก
    Click    button >> text=Save

Click Edit Button
    [Documentation]    คลิกปุ่มแก้ไข
    Click    button >> text=Edit

Click Delete Button
    [Documentation]    คลิกปุ่มลบ
    Click    button >> text=Delete

Confirm Delete
    [Documentation]    ยืนยันการลบในกล่องยืนยัน
    Click    button >> text=Confirm

Cancel Delete
    [Documentation]    ยกเลิกการลบในกล่องยืนยัน
    Click    button >> text=Cancel

Fill Title Field
    [Documentation]    กรอกชื่อเรื่อง
    [Arguments]    ${title}
    Fill Text    input[name="title"]    ${title}

Fill Description Field
    [Documentation]    กรอกรายละเอียด
    [Arguments]    ${description}
    Fill Text    textarea[name="description"]    ${description}

Select Category
    [Documentation]    เลือกหมวดหมู่
    [Arguments]    ${category}
    Select Options By    select[name="category"]    text    ${category}

Select Priority
    [Documentation]    เลือกลำดับความสำคัญ
    [Arguments]    ${priority}
    Select Options By    select[name="priority"]    text    ${priority}

Fill Owner Field
    [Documentation]    กรอกชื่อเจ้าของ
    [Arguments]    ${owner}
    Fill Text    input[name="owner"]    ${owner}

Fill Assignee Field
    [Documentation]    กรอกชื่อผู้รับผิดชอบ
    [Arguments]    ${assignee}
    Fill Text    input[name="assignee"]    ${assignee}

Select Role
    [Documentation]    เลือกบทบาท
    [Arguments]    ${role}
    Select Options By    select[name="role"]    text    ${role}

Select Requirement
    [Documentation]    เลือก Requirement ที่เชื่อมโยง
    [Arguments]    ${requirement}
    Select Options By    select[name="requirement"]    text    ${requirement}

Select Task
    [Documentation]    เลือก Task ที่เชื่อมโยง
    [Arguments]    ${task}
    Select Options By    select[name="task"]    text    ${task}

Select Defect Type
    [Documentation]    เลือกประเภท Defect
    [Arguments]    ${type}
    Select Options By    select[name="type"]    text    ${type}

Select Severity
    [Documentation]    เลือกระดับความรุนแรง
    [Arguments]    ${severity}
    Select Options By    select[name="severity"]    text    ${severity}

Fill Reporter Field
    [Documentation]    กรอกชื่อผู้รายงาน
    [Arguments]    ${reporter}
    Fill Text    input[name="reporter"]    ${reporter}

Fill Search Field
    [Documentation]    กรอกข้อความค้นหา
    [Arguments]    ${text}
    Fill Text    input[name="search"]    ${text}

Select Filter Option
    [Documentation]    เลือกตัวกรอง
    [Arguments]    ${filter_name}    ${value}
    Select Options By    select[name="${filter_name}"]    text    ${value}

Element Should Contain Text
    [Documentation]    ตรวจสอบว่า element มีข้อความที่ระบุ
    [Arguments]    ${selector}    ${expected_text}
    Get Text    ${selector}    contains    ${expected_text}

Element Should Be Visible
    [Documentation]    ตรวจสอบว่า element แสดงผล
    [Arguments]    ${selector}
    Get Element States    ${selector}    contains    visible

Validation Error Should Be Shown
    [Documentation]    ตรวจสอบว่ามีข้อความแจ้งเตือน validation error
    [Arguments]    ${message}
    Get Text    .error-message    contains    ${message}

Confirmation Dialog Should Be Visible
    [Documentation]    ตรวจสอบว่ากล่องยืนยันแสดงอยู่
    Get Element States    .confirmation-dialog    contains    visible

Warning Message Should Contain
    [Documentation]    ตรวจสอบข้อความเตือนในกล่องยืนยัน
    [Arguments]    ${message}
    Get Text    .warning-message    contains    ${message}

Count Badge Should Show
    [Documentation]    ตรวจสอบจำนวนที่แสดงใน badge
    [Arguments]    ${selector}    ${count}
    Get Text    ${selector}    ==    ${count}
