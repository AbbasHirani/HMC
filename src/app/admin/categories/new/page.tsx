import CategoryForm from '../CategoryForm';

export default function NewCategoryPage() {
  return (
    <>
      <div className="adm-topbar"><h1>New Category</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Add category</h2>
          <a href="/admin/categories" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        <CategoryForm mode="new" />
      </div>
    </>
  );
}
