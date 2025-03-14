import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Flex,
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Image,
  Text,
  Collapse,
  List,
  ListItem,
  IconButton,
  Spinner,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertTitle,
  Tag,
  TagLabel,
  TagRightIcon,
  Spacer,
  Badge,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, StarIcon, CloseIcon } from "@chakra-ui/icons";
// import { CloseIcon } from '@chakra-ui/icons'

const TestGithubSearchUser = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState({});
  const [openUser, setOpenUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(storedHistory);

  }, []);

  const searchUsers = async (username) => {
    if (!username.trim()) return;

    setLoading(true);
    const response = await fetch(`https://api.github.com/search/users?q=${username}&per_page=5`);
    const data = await response.json();
    console.log(data);
    setUsers(data.items || []);

    data.items.forEach(user => fetchRepos(user));
    setLoading(false);

    const updatedHistory = [username, ...history.filter(h => h !== username)].slice(0, 8);
    setHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const fetchRepos = async (user) => {
    if (repos[user.login]) return;

    const response = await fetch(`https://api.github.com/users/${user.login}/repos`);
    const data = await response.json();
    console.log("SHOW", data);
    setRepos(prevRepos => ({ ...prevRepos, [user.login]: data }));
  };


  const handleToggleCollapse = (user) => {
    setOpenUser(prev => (prev === user.login ? null : user.login));
  };


  const resetSearch = () => {
    setUsername("");
    setUsers([]);
    setRepos({});
    setOpenUser(null);
  };

  const removeHistoryItem = (item) => {
    const updatedHistory = history.filter((h) => h !== item);
    setHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <ChakraProvider>
      <VStack p={4} align="stretch" maxW="400px" mx="auto">
        <InputGroup>
          <Input
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {username && (
            <InputRightElement>
              <IconButton icon={<CloseIcon boxSize={2} />} size="xs" onClick={resetSearch} aria-label="Clear search" />
            </InputRightElement>
          )}
        </InputGroup>
        <Button colorScheme="blue" onClick={() => { searchUsers(username); }} isLoading={loading} size="sm">Search</Button>

        {history.length > 0 && (
          <Box>
            <Flex>
              <Box >
                <Text fontSize="10pt" fontWeight="bold">Search History</Text>
              </Box>
              <Spacer />
              <Box >
                <Text fontSize="10pt" cursor="pointer" onClick={clearHistory}>Clear</Text>
              </Box>
            </Flex>

            <HStack wrap="wrap" mt="2">
              {history.map((item, index) => (
                <Tag
                  size="sm"
                  key={index}
                  variant="outline"
                  colorScheme="blue"
                  cursor="pointer"
                  onClick={() => {
                    setUsername(item);
                    searchUsers(item);
                  }}
                >
                  <TagLabel>{item}</TagLabel>
                  <TagRightIcon as={CloseIcon} cursor="pointer" onClick={(e) => {
                    removeHistoryItem(item);
                  }} />
                </Tag>
              ))}
            </HStack>

          </Box>
        )}

        {users.length > 0 && (
          <Box>
            <Text>Showing users for "{username}"</Text>
            <List spacing={2} mt={2}>
              {users.map((user) => (
                <ListItem key={user.id} borderWidth={1} borderRadius="md" p={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} cursor="pointer" onClick={() => handleToggleCollapse(user)}>
                      <Image boxSize="40px" borderRadius="full" src={user.avatar_url} alt={user.login} />
                      <Text fontWeight="bold">{user.login} ({repos[user.login]?.length || 0})</Text>
                    </HStack>
                    <IconButton
                      icon={openUser === user.login ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={() => handleToggleCollapse(user)}
                      size="sm"
                      aria-label="Toggle Repos"
                    />
                  </Box>
                  <Collapse in={openUser === user.login} animateOpacity style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <List spacing={2} mt={2}>
                      {repos[user.login]?.length > 0 ? (
                        repos[user.login].map((repo) => (
                          <ListItem key={repo.id} p={2} bg="gray.100" borderRadius="md">
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Text fontWeight="bold" fontSize="12pt">{repo.name}</Text>
                              <Box display="flex" alignItems="center">
                                <Text mr={1} fontSize="9pt">{repo.stargazers_count}</Text>
                                <StarIcon color="yellow.400" fontSize="9pt" />
                              </Box>
                            </Box>
                            <Text fontSize="sm" color="gray.600">
                              {repo.description || "No description"}
                            </Text>
                            <Badge variant='outline' colorScheme='green'>
                              {repo.language || ""}
                            </Badge>

                          </ListItem>
                        ))
                      ) : (
                        <Alert status='error'>
                          <AlertIcon />
                          <AlertTitle>There is no public repository</AlertTitle>

                        </Alert>
                      )}
                    </List>
                  </Collapse>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>
    </ChakraProvider>
  );
};

export default TestGithubSearchUser;