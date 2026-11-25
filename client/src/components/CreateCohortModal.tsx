import { FormEvent, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API, errorMessage } from "../lib/api";
import Modal from "./ui/Modal";

interface CreateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCohortModal = ({ isOpen, onClose, onSuccess }: CreateCohortModalProps) => {
  const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/cohorts`, {
        name: formData.name,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      toast.success("Cohort created");
      setFormData({ name: "", startDate: "", endDate: "" });
      onSuccess();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to create cohort"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Start a new cohort" eyebrow="Facilitator">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="field-label">Cohort name</span>
          <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Lagos Spring ’26" maxLength={50} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Start date</span>
            <input type="date" className="input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          </label>
          <label className="block">
            <span className="field-label">End date</span>
            <input type="date" className="input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </label>
        </div>
        <p className="text-xs text-faint">Week 1 begins on the start date. Founders get one public and one private commitment per week.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Creating…" : "Create cohort"}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCohortModal;
