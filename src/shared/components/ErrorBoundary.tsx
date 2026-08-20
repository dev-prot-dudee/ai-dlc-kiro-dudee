import { Component, type ErrorInfo, type ReactNode } from "react";
import { STORAGE_KEYS } from "../storage";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * FR6.3 — ข้อมูลเสียหายต้องไม่ทำให้จอขาว
 *
 * ดักทุก error ที่หลุดขึ้นมาถึงระดับ render และแสดงข้อความที่อ่านได้ พร้อมทาง
 * ออกให้ผู้ใช้ (ล้างข้อมูลที่เสียแล้วเริ่มใหม่) เพราะเมื่อข้อมูลใน localStorage
 * เสียหาย ผู้ใช้ไม่มีทางแก้เองได้เลยถ้าแอปเปิดไม่ขึ้น
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // error ต้องถูกรายงาน ไม่ใช่ล้มเหลวเงียบๆ
    console.error("เกิดข้อผิดพลาดที่ระดับหน้าจอ:", error, info.componentStack);
  }

  private resetData = (): void => {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    return (
      <div style={{ padding: 32, maxWidth: 640 }} data-testid="error-boundary">
        <div className="alert">
          <p className="alert__title">เปิดหน้าจอนี้ไม่ได้</p>
          <p>{error.message}</p>
        </div>
        <p>
          สาเหตุที่พบบ่อยคือข้อมูลที่เก็บไว้ในเบราว์เซอร์เสียหาย การล้างข้อมูลจะทำให้
          Requirement, Task และ Defect ทั้งหมดในเครื่องนี้หายไป และกู้คืนไม่ได้
          หากมีไฟล์ที่ export ไว้ ให้ import กลับหลังล้าง
        </p>
        <div className="form__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            ลองเปิดใหม่
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={this.resetData}
            data-testid="reset-data"
          >
            ล้างข้อมูลแล้วเริ่มใหม่
          </button>
        </div>
      </div>
    );
  }
}
