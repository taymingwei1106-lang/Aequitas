import { Component } from "react";

/*
 * Catches rendering errors in the section it wraps, so one failing
 * calculation shows a contained message instead of a blank page.
 *
 * Pass a changing `resetKey` (e.g. the route or active tab) to clear the
 * error automatically when the user moves elsewhere.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(
      `Aequitas: "${this.props.label || "section"}" failed to render.`,
      error,
      info?.componentStack
    );
  }

  componentDidUpdate(previousProps) {
    if (
      this.state.error &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="card"
        role="alert"
        style={{ border: "1px solid var(--color-danger-border)", marginTop: 16 }}
      >
        <h3 style={{ marginTop: 0 }}>
          ⚠️ {this.props.label || "This section"} couldn't be displayed
        </h3>
        <p className="page-subtitle">
          Your data has not been changed. The rest of Aequitas is still
          available.
        </p>
        <details style={{ marginBottom: 14 }}>
          <summary className="page-subtitle" style={{ cursor: "pointer" }}>
            Technical detail
          </summary>
          <code
            style={{
              display: "block",
              marginTop: 8,
              fontSize: 12,
              whiteSpace: "pre-wrap",
              opacity: 0.8,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </code>
        </details>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
      </div>
    );
  }
}
