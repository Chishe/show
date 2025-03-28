const CustomNode = ({ data }) => {
  return (
    <div
      className="custom-node"
      style={{ padding: "10px", borderRadius: "8px" }}
    >
      <h3>{data.label}</h3>
      <div>
        <strong>Percentage: </strong>
        {data.percentage}%
      </div>
      <div>
        <strong>Defect: </strong>
        {data.defect}
      </div>
    </div>
  );
};
export default CustomNode;
