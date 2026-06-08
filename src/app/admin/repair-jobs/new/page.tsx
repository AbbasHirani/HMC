import RepairJobForm from '../RepairJobForm';

export default function NewRepairJobPage() {
  return (
    <>
      <div className="adm-topbar"><h1>Add Repair Job</h1></div>
      <div className="adm-content">
        <RepairJobForm mode="new" />
      </div>
    </>
  );
}
