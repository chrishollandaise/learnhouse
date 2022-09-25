import React from "react";
import Layout from "../../components/ui/layout";
import { Title } from "../../components/ui/styles/title";
import { createNewOrganization } from "../../services/orgs";

const Organizations = () => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log({ name, description, email });
    const status = await createNewOrganization({ name, description, email });
   alert(JSON.stringify(status));

  };

  return (
    <Layout>
      <Title>New Organization</Title>
      Name: <input onChange={handleNameChange} type="text" />
      <br />
      Description: <input onChange={handleDescriptionChange} type="text" />
      <br />
      Email Address: <input onChange={handleEmailChange} type="text" />
      <br />
      <button onClick={handleSubmit}>Create</button>
    </Layout>
  );
};

export default Organizations;