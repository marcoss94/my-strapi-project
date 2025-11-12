export function FormError({ error }: { error: string[] | undefined }) {
  if (!error) return null;
  return error.map((err, index) => (
    <div className="text-pink-500 text-sm italic mt-1 py-2" key={index}>
      {err}
    </div>
  ));
}
