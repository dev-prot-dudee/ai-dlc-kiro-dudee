<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-08-20T07:00:00Z — ตีความ `AIDLC-UNIT` สำหรับงาน zero-Unit ว่าใช้ `.` เพื่อให้ path ที่เครื่องมือประกอบ (`construction/<unit>/code-generation/`) ย่อกลับมาเป็น `construction/code-generation/` ตามที่ stage file กำหนดว่าห้ามใส่ชื่อ unit สังเคราะห์; `aidlc-testing-posture.ts verify --unit "."` ยืนยันหลักฐานอนุมัติผ่านด้วยวิธีนี้
- 2026-08-20T07:00:00Z — ตีความ `API / endpoint` ใน `testable_layers` ของ Testing Contract ว่าไม่มีในรอบนี้เพราะไม่มี backend (constraint C1) และให้ repository layer ที่คุยกับ localStorage ทำหน้าที่เป็นขอบเขต I/O แทน แล้วบันทึกการตีความนี้ไว้ในแผนก่อนขออนุมัติ
- 2026-08-20T07:00:00Z — ตีความ BDD ระดับ feature slice ไม่ใช่ระดับ layer: เขียน scenario ของ shared layer ทั้งก้อนก่อน implement ทั้งก้อน แทนการทำ Red/Green ทีละ function ตามที่ contract ระบุว่าห้ามแปลง BDD เป็น TDD ระดับ layer

## Deviations
- 2026-08-20T07:00:00Z — สร้าง `ModulePage.tsx` แบบ generic แทนหน้าจอ list/detail แยกต่อ module ตามที่แผนระบุ; ทั้ง 3 module มีรูปแบบหน้าจอเหมือนกันทุกอย่างต่างกันแค่ field และวิธีจัดกลุ่ม การเขียนแยกจะได้โค้ดซ้ำประมาณ 600 บรรทัดที่ต้องแก้พร้อมกันทุกครั้ง และยังคงเป้าหมายการแบ่งงาน 3 ทีมไว้เพราะ ModulePage อยู่ใน shared/ ที่ต้องนิ่งก่อน
- 2026-08-20T07:00:00Z — รันงาน generation ในเซสชันนี้เองแทนการ dispatch ไปยัง developer agent; plan-approval guard บล็อก dispatch เพราะ hook คาดหวังโครง `construction/<unit>/code-generation/` แต่ zero-Unit เขียนที่ `construction/code-generation/` ทำให้ knownUnits() อ่านชื่อ unit เป็น "code-generation" แล้วหาไฟล์ที่ `construction/code-generation/code-generation/` ไม่พบ จึงไม่มีค่า marker ใดที่ผ่าน guard ได้ ใช้ทางสำรอง "Run it here" ที่ ensemble protocol กำหนดไว้สำหรับ dispatch ที่ล้มเหลว
- 2026-08-20T07:00:00Z — เพิ่มไฟล์ที่แผนไม่ได้ระบุ 4 ไฟล์ (`Field.tsx`, `ModulePage.tsx`, `status-colors.ts`, `DataContext.tsx`); จำเป็นเพื่อให้ทั้ง 3 module เห็นข้อมูลข้ามกันตาม FR4 และไม่เขียน validation ซ้ำในทุกฟอร์ม
- 2026-08-20T07:00:00Z — ติดตั้ง MemoryStorage ทับ localStorage global ใน test-setup; Node 25 มี localStorage แบบ experimental ที่บดทับของ jsdom และพังเพราะไม่มี path ทำให้ test ทุกตัวที่พึ่ง localStorage ใช้ไม่ได้ ทางเลือกอื่นคือ pin Node ให้ต่ำกว่า 25 ซึ่งควบคุมไม่ได้ในเครื่องของทุกคนในทีม

## Tradeoffs
- 2026-08-20T07:00:00Z — เลือกวาง validation ที่ repository ที่เดียวแล้วให้ฟอร์มจับ ValidationError มาแสดง แทนการ validate ในฟอร์มก่อนส่ง; แลกกับการที่ฟอร์มต้องส่งค่าว่างลงไปให้ถูกปฏิเสธ แต่ได้กฎที่มีที่มาที่เดียวและบังคับทั้งตอนสร้างและตอนแก้ ซึ่งสำคัญเพราะ requirements ระบุกฎบังคับไว้ 7 ข้อ (FR1.2, FR1.3, FR2.2, FR2.3, FR3.2, FR3.3, FR3.4)
- 2026-08-20T07:00:00Z — เขียน test 56 ตัวแทน 43 ตามแผน; Minimal strategy กำหนด 1 test ต่อ 1 requirement แต่บาง FR ต้องมากกว่า 1 scenario จึงครอบได้จริง เช่น FR1.2 ต้องทดสอบทั้งกรณีเว้นว่างและกรณีใส่ค่านอกชุดที่อนุญาต ยอมเกินเป้าเพราะ strategy ระบุว่าเป็นแนวทางไม่ใช่เพดานตายตัว
- 2026-08-20T07:00:00Z — เปิด ESLint option `ignoreRestSiblings` แทนการเขียนโค้ดอ้อมให้ linter พอใจ; option นี้มีไว้สำหรับ pattern การตัด field ออกด้วย rest destructuring โดยเฉพาะ การเขียนอ้อมจะได้โค้ดที่อ่านยากกว่าเพื่อแลกกับความสงบของเครื่องมือ

## Open questions
- 2026-08-20T07:00:00Z — plan-approval guard กับ zero-Unit layout ขัดกันเชิงโครงสร้าง (hook คาดหวัง `construction/<unit>/code-generation/`, stage file ห้ามใส่ unit สังเคราะห์); ถ้าใช้ express scope อีกครั้งจะเจอปัญหาเดิม ควรแจ้งผู้ดูแล framework
- 2026-08-20T07:00:00Z — ยังไม่ได้วัด NFR1-NFR4 ด้วยเครื่องมือจริง (Lighthouse, ข้อมูล 500 รายการ, ทดสอบข้ามเบราว์เซอร์); ต้องทำในขั้น Build and Test ไม่ควรถือว่าผ่านจนกว่าจะมีตัวเลข
- 2026-08-20T07:00:00Z — ยังไม่ยืนยันว่าทีมคุ้นกับ TypeScript strict mode หรือไม่ (assumption A3 จาก requirements); โค้ดเปิด strict ทุก flag รวม noUncheckedIndexedAccess ซึ่งเข้มกว่าค่าปกติและอาจทำให้ทีมที่ไม่คุ้นเสียเวลา
