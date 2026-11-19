import Button from "../ui/Button";

export default function ActionPanel({

  onEdit,

  onDelete,

}) {

  return (

    <div className="action-panel">

      <Button

        onClick={onEdit}

      >

        Edit Investment

      </Button>

      <Button

        variant="secondary"

        onClick={onDelete}

      >

        Delete

      </Button>

    </div>

  );

}