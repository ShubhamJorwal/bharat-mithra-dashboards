import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import geographyApi from "@/services/api/geography.api";
import type { State } from "@/types/api.types";
import "./StateStaff.scss";

const StateStaff = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!code) return;
      setLoading(true);
      setError(null);
      try {
        const r = await geographyApi.getStateByCode(code.toUpperCase());
        if (!cancelled) setState((r as any).data || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || "Failed to load state");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={state ? `${state.name} — Staff Management` : "State Staff Management"}
        description={state?.tagline as any}
        actions={
          <button
            type="button"
            className="bm-btn-back"
            onClick={() => navigate("/staff")}
          >
            <HiOutlineArrowLeft /> Back to states
          </button>
        }
      />

      {loading && <div className="bm-loading">Loading state…</div>}
      {error && <div className="bm-error">{error}</div>}

      {state && (
        <>
          <div className="bm-state-hero">
            {state.banner_image_url && (
              <img src={state.banner_image_url as any} alt={state.name} />
            )}
            <div className="bm-state-hero-meta">
              <span className="bm-pill">Live</span>
              <h2>{state.name}</h2>
              {state.capital && <p>Capital · {state.capital}</p>}
            </div>
          </div>

          <div className="bm-coming-soon">
            <h3>State-level staff workflows coming next</h3>
            <p>
              You picked a live state. The next step (district/taluk drilldown,
              role assignments, hiring board) will be wired in the next iteration.
            </p>
            <Link to="/staff/members" className="bm-link">
              View all staff members →
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default StateStaff;
