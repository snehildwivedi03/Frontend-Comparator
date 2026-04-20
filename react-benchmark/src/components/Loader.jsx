export default function Loader({ size = 18 }) {
  return (
    <div
      className="border-2 border-white border-t-transparent rounded-full animate-spin"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
