"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "../store-provider";
export function useResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api<T>(url)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [url, version]);
  const reload = useCallback(() => {
    setData(null);
    setError("");
    setVersion((v) => v + 1);
  }, []);
  return { data, error, reload };
}
export function ResourceState({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return error ? (
    <div className="form-error" role="alert">
      {error}{" "}
      <button onClick={retry} style={{ textDecoration: "underline" }}>
        Try again
      </button>
    </div>
  ) : (
    <div className="loading-page">
      <span className="spinner" />
    </div>
  );
}
