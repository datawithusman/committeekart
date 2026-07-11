/*
 * Committee Settings component (client component).
 *
 * Provides edit (name, description, status) and delete functionality
 * for the committee detail page.
 *
 * Shown as a toggle panel that slides open when the user clicks
 * "Committee Settings".
 */

"use client";

import { useState, useTransition } from "react";
import { updateCommittee, deleteCommittee } from "@/app/(dashboard)/committees/[id]/committee-actions";

export interface CommitteeSettingsProps {
  committeeId: string;
  initialName: string;
  initialDescription: string | null;
  initialStatus: string;
}

export default function CommitteeSettings({
  committeeId,
  initialName,
  initialDescription,
  initialStatus,
}: CommitteeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, startDelete] = useTransition();

  function handleOpen() {
    setIsOpen(!isOpen);
    setErrorMsg(null);
  }

  function handleUpdate(formData: FormData) {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await updateCommittee(committeeId, formData);
      if (!result.success) {
        setErrorMsg(result.error || "Update failed");
      } else {
        setIsOpen(false);
      }
    });
  }

  function handleDelete() {
    if (deleteConfirmText !== "DELETE") return;
    startDelete(async () => {
      const result = await deleteCommittee(committeeId);
      if (!result.success) {
        setErrorMsg(result.error || "Delete failed");
        setShowDeleteConfirm(false);
      }
      // On success, the action redirects to /dashboard
    });
  }

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        onClick={handleOpen}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
      >
        {isOpen ? "Close Settings" : "Committee Settings"}
      </button>

      {/* Edit panel */}
      {isOpen && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Edit Committee
          </h3>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
              {errorMsg}
            </div>
          )}

          <form action={handleUpdate} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Committee Name
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                defaultValue={initialName}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="edit-description"
                name="description"
                rows={2}
                defaultValue={initialDescription || ""}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="edit-status" className="mb-1.5 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="edit-status"
                name="status"
                defaultValue={initialStatus}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Delete section */}
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="mb-2 text-sm font-semibold text-danger">
              Delete Committee
            </h4>
            <p className="mb-4 text-xs text-muted">
              Yeh committee aur sab data (members, contributions, draws) permanently delete ho jayega. Yeh action reversible nahi hai.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-danger/50 px-4 py-2 text-sm font-medium text-danger hover:bg-danger-light"
              >
                Delete Committee
              </button>
            ) : (
              <div className="rounded-lg border border-danger/50 bg-danger-light/30 p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Confirm karne ke liye <code className="rounded bg-background px-1.5 py-0.5">DELETE</code> type karein:
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-danger focus:outline-none"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
