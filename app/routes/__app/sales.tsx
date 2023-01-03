import { json } from "@remix-run/server-runtime";

export const loader = () => {
  console.log("sales");
  return json({});
};

export default function SalesPage() {
  return <div>sales</div>;
}
