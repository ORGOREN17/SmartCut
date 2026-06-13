export interface ComparisonImageMeta {
  name: string;
  size: number;
}

export interface ComparisonImagePayload {
  previewUrl: string;
  base64: string;
  meta: ComparisonImageMeta;
}

const RESULT_IMAGE_KEY = "smartcut_result_image";
const RESULT_BASE64_KEY = "smartcut_result_base64";
const RESULT_META_KEY = "smartcut_result_meta";

let inMemoryResultImage: ComparisonImagePayload | null = null;

const safeSessionSet = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[comparisonFlowStore] Could not persist ${key}; using in-memory handoff`, error);
    return false;
  }
};

const safeSessionRemove = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`[comparisonFlowStore] Could not remove ${key}`, error);
  }
};

export const saveComparisonImagePayload = (payload: ComparisonImagePayload) => {
  inMemoryResultImage = payload;
  safeSessionRemove(RESULT_IMAGE_KEY);
  safeSessionRemove(RESULT_BASE64_KEY);
  safeSessionRemove(RESULT_META_KEY);
  safeSessionSet(RESULT_IMAGE_KEY, payload.previewUrl);
  safeSessionSet(RESULT_META_KEY, JSON.stringify(payload.meta));
  if (!safeSessionSet(RESULT_BASE64_KEY, payload.base64)) {
    safeSessionRemove(RESULT_BASE64_KEY);
  }
};

export const getComparisonImagePayload = (): Partial<ComparisonImagePayload> | null => {
  if (inMemoryResultImage) return inMemoryResultImage;
  try {
    const previewUrl = sessionStorage.getItem(RESULT_IMAGE_KEY) || undefined;
    const base64 = sessionStorage.getItem(RESULT_BASE64_KEY) || undefined;
    const rawMeta = sessionStorage.getItem(RESULT_META_KEY);
    const meta = rawMeta ? JSON.parse(rawMeta) as ComparisonImageMeta : undefined;
    return previewUrl || base64 || meta ? { previewUrl, base64, meta } : null;
  } catch {
    return null;
  }
};

export const clearComparisonImagePayload = () => {
  inMemoryResultImage = null;
  safeSessionRemove(RESULT_IMAGE_KEY);
  safeSessionRemove(RESULT_BASE64_KEY);
  safeSessionRemove(RESULT_META_KEY);
};

// ---- Selected style handoff (Catalog → Guidance) ---------------------------

export interface SelectedStylePayload {
  id: string;
  name: string;
  matchScore: number;
  explanation: string;
  generatedImageUrl: string;
}

const SELECTED_STYLE_KEY = "smartcut_selected_style";
let inMemorySelectedStyle: SelectedStylePayload | null = null;

export const saveSelectedStyle = (payload: SelectedStylePayload) => {
  inMemorySelectedStyle = payload;
  // Try to persist; quota errors are fine — in-memory copy is the source of truth.
  safeSessionSet(SELECTED_STYLE_KEY, JSON.stringify(payload));
};

export const getSelectedStyle = (): SelectedStylePayload | null => {
  if (inMemorySelectedStyle) return inMemorySelectedStyle;
  try {
    const raw = sessionStorage.getItem(SELECTED_STYLE_KEY);
    return raw ? (JSON.parse(raw) as SelectedStylePayload) : null;
  } catch {
    return null;
  }
};

export const clearSelectedStyle = () => {
  inMemorySelectedStyle = null;
  safeSessionRemove(SELECTED_STYLE_KEY);
};