import type { RootState, store } from "@/store";
import { useDispatch, useSelector } from "react-redux";

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector = useSelector.withTypes<RootState>();
