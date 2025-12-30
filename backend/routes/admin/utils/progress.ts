export interface UploadProgress {
  totalRecords: number;
  processedRecords: number;
  failedRecords?: { id: string; reason?: any }[];
  errors?: any[];
  status: "pending" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  percentage?: number;
}

const progressStore: Map<string, UploadProgress> = new Map();

export default progressStore;
