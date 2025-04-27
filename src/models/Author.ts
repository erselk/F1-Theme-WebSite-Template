export interface Author {
  _id?: string;
  name: string;
  profileImage: string;
  bio?: string;
  articles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}