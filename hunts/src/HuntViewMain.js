import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { fetchPuzzles, selectPuzzleTableData } from "./puzzlesSlice";
import { fetchHunt } from "./huntSlice";
import { showModal, hideModal } from "./modalSlice";
import { hideAlert } from "./alertSlice";
import { PuzzleTable } from "./puzzle-table";
import AnswerCell from "./AnswerCell";
import NameCell from "./NameCell";
import GlobalFilter from "./GlobalFilter";
import StatusCell from "./StatusCell";
import DeleteAnswerModal from "./DeleteAnswerModal";
import TagCell from "./TagCell";
import DeletePuzzleModal from "./DeletePuzzleModal";
import EditAnswerModal from "./EditAnswerModal";
import EditPuzzleModal from "./EditPuzzleModal";
import AddPuzzleModal from "./AddPuzzleModal";
import SubmitAnswerModal from "./SubmitAnswerModal";
import EditPuzzleTagsModal from "./EditPuzzleTagsModal";
import useInterval from "@use-it/interval";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

const MODAL_COMPONENTS = {
  DELETE_PUZZLE: DeletePuzzleModal,
  EDIT_PUZZLE: EditPuzzleModal,
  ADD_PUZZLE: AddPuzzleModal,
  SUBMIT_ANSWER: SubmitAnswerModal,
  DELETE_ANSWER: DeleteAnswerModal,
  EDIT_ANSWER: EditAnswerModal,
  EDIT_TAGS: EditPuzzleTagsModal,
};

const TABLE_COLUMNS = [
  {
    Header: "Name",
    accessor: "name",
    Cell: NameCell,
  },
  {
    Header: "Answer",
    accessor: (row) => row.guesses.map(({ text }) => text).join(" "),
    Cell: AnswerCell,
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: StatusCell,
  },
  {
    Header: "Puzzle",
    accessor: "url",
    Cell: ({ row, value }) => (
      <a href={value} target="_blank">
        Puzzle
      </a>
    ),
  },
  {
    Header: "Sheet",
    accessor: "sheet",
    Cell: ({ row, value }) =>
      value ? (
        <a href={value} target="_blank">
          Sheet
        </a>
      ) : null,
  },
  {
    Header: "Chat",
    accessor: "chat_room",
    Cell: ({ row, value }) =>
      row.original.chat_room ? (
        <>
          <a href={row.original.chat_room.audio_channel_url} target="_blank">
            Voice
          </a>
          <br />
          <a href={row.original.chat_room.text_channel_url} target="_blank">
            Text
          </a>
        </>
      ) : null,
  },
  {
    Header: "Tags",
    id: "tags",
    accessor: (row) => row.tags.map(({ name }) => name).join(" "),
    Cell: TagCell,
  },
  {
    accessor: "is_meta",
    id: "is_meta",
  },
  {
    accessor: "id",
    id: "id",
  },
];

export const HuntViewMain = (props) => {
  const tableData = useSelector(selectPuzzleTableData);
  const modal = useSelector((state) => state.modal);
  const hunt = useSelector((state) => state.hunt);
  const alert = useSelector((state) => state.alert);
  const [filter, setFilter] = React.useState("");
  const dispatch = useDispatch();

  const updatePuzzleData = () => {
    dispatch(fetchPuzzles(props.huntId));
  };

  useInterval(updatePuzzleData, 10 * 1000);

  const ModalComponent = MODAL_COMPONENTS[modal.type];
  React.useEffect(() => {
    dispatch(fetchHunt(props.huntId));
    updatePuzzleData();
  }, [props.huntId]);

  React.useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => dispatch(hideAlert()), 8 * 1000);
      return () => clearTimeout(timer);
    }
  }, [alert.id]);

  return (
    <div>
      <Alert
        dismissible
        variant={alert.variant}
        show={alert.show}
        onClose={() => dispatch(hideAlert())}
      >
        {alert.text}
      </Alert>
      <h1>{hunt.name} - All Puzzles</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "2px",
          alignItems: "center",
        }}
      >
        <GlobalFilter globalFilter={filter} setGlobalFilter={setFilter} />
        <Button
          variant="primary"
          size="lg"
          onClick={() =>
            dispatch(
              showModal({
                type: "ADD_PUZZLE",
                props: {
                  huntId: props.huntId,
                },
              })
            )
          }
        >
          Add Puzzle
        </Button>
      </div>
      <PuzzleTable columns={TABLE_COLUMNS} data={tableData} filter={filter} />
      <Modal
        animation={false}
        show={modal.show}
        onHide={() => dispatch(hideModal())}
      >
        {ModalComponent ? <ModalComponent {...modal.props} /> : null}
      </Modal>
    </div>
  );
};

HuntViewMain.propTypes = {
  huntId: PropTypes.string.isRequired,
};
