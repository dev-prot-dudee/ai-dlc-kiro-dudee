# Robot Framework — PM Tool MVP (Tester-Aiy)

## วิธีติดตั้ง

```bash
# 1. ติดตั้ง Python (ถ้ายังไม่มี)
brew install python

# 2. ติดตั้ง Robot Framework + Browser Library
pip install robotframework
pip install robotframework-browser

# 3. ติดตั้ง browser สำหรับ Browser Library
rfbrowser init
```

## วิธีรัน

```bash
# เปิด dev server ก่อน (terminal แรก)
npm run dev

# รัน Robot test ทั้งหมด (terminal ที่สอง)
robot --outputdir results Tester-Aiy/robot/

# รันเฉพาะ module
robot --outputdir results Tester-Aiy/robot/requirements.robot
robot --outputdir results Tester-Aiy/robot/tasks.robot
robot --outputdir results Tester-Aiy/robot/defects.robot
robot --outputdir results Tester-Aiy/robot/traceability_and_storage.robot

# รันเฉพาะ tag (เช่น fail cases)
robot --include fail --outputdir results Tester-Aiy/robot/

# รันเฉพาะ pass cases
robot --include pass --outputdir results Tester-Aiy/robot/

# รันแบบเห็นเบราว์เซอร์ (ไม่ headless)
robot --variable HEADLESS:false --outputdir results Tester-Aiy/robot/
```

## ดู Report

หลังรันเสร็จ เปิดไฟล์ `results/report.html` ในเบราว์เซอร์:

```bash
open results/report.html
```

---

## สรุป Test Cases

| ไฟล์ | FR | จำนวน | Pass | Fail |
|------|-----|-------|------|------|
| `requirements.robot` | FR1 | 12 | 8 | 4 |
| `tasks.robot` | FR2 | 9 | 5 | 4 |
| `defects.robot` | FR3 | 11 | 6 | 5 |
| `traceability_and_storage.robot` | FR4+FR5+FR6 | 9 | 6 | 3 |
| **รวม** | | **41** | **25** | **16** |

### Tags ที่ใช้

| Tag | ความหมาย |
|-----|----------|
| `pass` | กรณีที่ต้องทำได้สำเร็จ (happy path) |
| `fail` | กรณีที่ต้องถูกปฏิเสธอย่างถูกต้อง (negative test) |
| `validation` | ทดสอบ validation rule |
| `create` | ทดสอบการสร้าง |
| `edit` | ทดสอบการแก้ไข |
| `delete` | ทดสอบการลบ |
| `cascade` | ทดสอบ cascade delete |
| `filter` | ทดสอบการกรอง |
| `search` | ทดสอบการค้นหา |
| `traceability` | ทดสอบสายเชื่อมโยง |
| `persistence` | ทดสอบข้อมูลคงอยู่ |
| `prerequisite` | ทดสอบกรณีไม่มีข้อมูลที่ต้องมีก่อน |
| `error-boundary` | ทดสอบกรณีข้อมูลเสีย |
| `cancel` | ทดสอบการยกเลิก |

---

## โครงสร้างไฟล์

```
Tester-Aiy/robot/
├── keywords.resource                  ← Keywords กลาง (reusable)
├── requirements.robot                 ← FR1: Requirement Management
├── tasks.robot                        ← FR2: Task Management
├── defects.robot                      ← FR3: Defect Tracking
├── traceability_and_storage.robot     ← FR4+FR5+FR6
└── README.md                          ← ไฟล์นี้
```
