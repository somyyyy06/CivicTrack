// src/hooks/use-toast.ts
export function useToast() {
  return {
    toast: (opts: any) => {
      if (opts?.title) alert(opts.title + (opts.description ? `: ${opts.description}` : ""));
    }
  };
} 