import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';

import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    wrongRepo: false,
  };

  // Carregar os dados do LocalStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados no LocalStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState !== repositories)
      localStorage.setItem('repositories', JSON.stringify(repositories));
  }

  handleInputChange = (event) => {
    this.setState({ newRepo: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      // verificação de repositórios duplicados
      const repoExist = repositories.find((repo) => repo.name === newRepo);

      if (!repoExist) {
        const response = await api.get(`/repos/${newRepo}`);

        const data = {
          name: response.data.full_name,
        };

        this.setState({
          repositories: [...repositories, data],
          newRepo: '',
          loading: false,
        });
      } else {
        throw new Error('Repositório duplicado');
      }
    } catch (error) {
      this.setState({ wrongRepo: true });
      console.log(error.message);
    }
  };

  render() {
    const { newRepo, loading, repositories, wrongRepo } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} wrongRepo={wrongRepo}>
          {wrongRepo ? (
            <>
              <input
                type="text"
                value={newRepo}
                onChange={this.handleInputChange}
              />
              <small>
                ❌ Repositório incorreto, atualize a paǵina e digite novamente
              </small>
            </>
          ) : (
            <input
              type="text"
              placeholder="Adicionar repositório"
              value={newRepo}
              onChange={this.handleInputChange}
            />
          )}

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
