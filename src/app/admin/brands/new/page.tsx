import BrandForm from '../BrandForm';

export default function NewBrandPage() {
  return (
    <>
      <div className="adm-topbar"><h1>New Brand</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Add brand</h2>
          <a href="/admin/brands" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        <BrandForm mode="new" />
      </div>
    </>
  );
}
