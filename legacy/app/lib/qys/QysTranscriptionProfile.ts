import { QysInitial } from "./QysInitial";

export interface QysTranscriptionProfile {
  is合口: boolean;
  canonical母: QysInitial;
  tone聲: "平" | "上" | "去" | "入";
  is重紐A類: boolean;
  qieyunCycleHead韻: string;
  contrastiveRow等: string | null;
}
