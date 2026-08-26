import { useMemo } from "react";

export default function PropertySelector({
    properties = [],
    value = "",
    onChange,
}) {

    const options = useMemo(() => {
        return [...properties].sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [properties]);

    return (
        <div style={{ marginBottom: 24 }}>
            <label className="page-subtitle">
                Select Property
            </label>

            <select
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                }}
            >
                <option value="">
                    -- Manual Entry --
                </option>

                                {options.map((property) => (
                    <option
                        key={property.id}
                        value={property.id}
                    >
                        🏠 {property.name}
                    </option>
                ))}
            </select>

            {value && (
                <div
                    style={{
                        marginTop: 8,
                        fontSize: "0.9rem",
                        color: "#6b7280",
                    }}
                >
                    Property selected. Calculator values can now be
                    auto-filled from your portfolio.
                </div>
            )}
        </div>
    );
}