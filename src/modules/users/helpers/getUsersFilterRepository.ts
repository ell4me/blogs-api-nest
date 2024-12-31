export const getUsersFilterRepository = (
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
) => {
  const filter: Record<string, object>[] = [];

  if (searchLoginTerm) {
    filter.push({
      login: {
        $regex: searchLoginTerm,
        $options: 'i',
      },
    });
  }

  if (searchEmailTerm) {
    filter.push({
      email: {
        $regex: searchEmailTerm,
        $options: 'i',
      },
    });
  }

  return filter;
};
