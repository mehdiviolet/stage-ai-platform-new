import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createConversation,
  deleteConversationById,
  getConversationById,
  getConversations,
  resetAll,
} from "../../features/chat/chatSlice";
import { deleteById } from "../../features/chat/chatSlice copy";

export default function Sidebar({ onItemClick }) {
  const dispatch = useAppDispatch();

  const { conversation } = useAppSelector((s) => s.chat);
  // console.log(converations);

  // const getAllConversations = async function () {
  //   const result = await dispatch(getConversations());

  //   setConversations(result.payload);
  //   console.log(result.payload);
  // };

  // useEffect(() => {
  //   dispatch(getConversations());
  // }, [conversation]);
  const handleDeleteAllConversations = function () {
    //No funziona perché non abbiamo EndPoin deleteAll
    dispatch(resetAll());
  };
  const selectedConversation = function (id: number) {
    dispatch(getConversationById(id));
    console.log(id);
  };

  const addConversation = function () {
    dispatch(
      createConversation({
        name: "nuova chat",
        model: "puyangwang/medgemma-27b-it:q6",
      })
    );
  };

  const deleteConversation = async function (id: number) {
    await dispatch(deleteConversationById(id));
  };
  return (
    <div>
      <p>sidebar</p>
      <button style={{ color: "green" }} onClick={addConversation}>
        + New Chat
      </button>
      <button onClick={handleDeleteAllConversations}>Delete All</button>
      <hr />
      {conversation?.map((conversation) => {
        // if (conversation.messageCount === 0) return;
        return (
          <ul key={conversation.id}>
            <li>
              <button onClick={() => selectedConversation(conversation.id)}>
                {conversation.id}
              </button>
              <button onClick={() => deleteConversation(conversation.id)}>
                Delete
              </button>
            </li>
          </ul>
        );
      })}
    </div>
  );
}
