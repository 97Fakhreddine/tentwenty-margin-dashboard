interface ImportCardProps {
  readonly title: string;
  readonly description: string;

  readonly action: (formData: FormData) => Promise<void>;
}

export function ImportCard({ title, description, action }: ImportCardProps) {
  return (
    <form
      action={action}
      className="rounded-xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="font-semibold text-zinc-950">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>

      <input
        type="file"
        name="file"
        accept=".xlsx"
        required
        className="mt-5 block w-full text-sm text-zinc-600"
      />

      <button
        type="submit"
        className="mt-5 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Upload
      </button>
    </form>
  );
}
