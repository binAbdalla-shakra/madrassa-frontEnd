

//LOGIN
export const POST_LOGIN = "/users/signin";

//============================================== SETTINGS =================================
// ROLE
export const GET_ROLE_LIST = "/roles";
export const ADD_NEW_ROLE = "/roles";
export const UPDATE_ROLE = "/roles";
export const DELETE_ROLE = "/roles";
export const GET_ROLES = "/roles";

// USERS
export const GET_USER_LIST = "/users";
export const ADD_NEW_USER = "/users";
export const UPDATE_USER = "/users";
export const DELETE_USER = "/users";
export const GET_USERS = "/users";

// BRANCHES
export const GET_BRANCH_LIST = "/branches";
export const ADD_NEW_BRANCH = "/branches";
export const UPDATE_BRANCH = "/branches";
export const DELETE_BRANCH = "/branches";
export const GET_BRANCHES = "/branches";

// MADRASSAS
export const ADD_NEW_MADRASSA = "/madrassa";
export const UPDATE_MADRASSA = "/madrassa";
export const DELETE_MADRASSA = "/madrassa";
export const GET_MADRASSAS = "/madrassa";

//============================================== END OF SETTINGS =================================

// ============================== sTART OF ACAdEMICS =========================


export const ADD_NEW_PARENT = "/parents";
export const UPDATE_PARENT = "/parents";
export const DELETE_PARENT = "/parents";
export const GET_PARENTS = "/parents";


export const ADD_NEW_STUDENT = "/students";
export const UPDATE_STUDENT = "/students";
export const DELETE_STUDENT = "/students";
export const GET_STUDENTS = "/students";

export const ADD_NEW_TEACHER = "/teachers";
export const UPDATE_TEACHER = "/teachers";
export const DELETE_TEACHER = "/teachers";
export const GET_TEACHERS = "/teachers";
// ============================== END OF ACAdEMICS =========================


// Group API endpoints
export const ADD_NEW_GROUP = "/groups";                   // POST
export const UPDATE_GROUP = "/groups";      // PUT
export const DELETE_GROUP =  "/groups";      // DELETE
export const GET_GROUPS = "/groups";                  // GET
export const GET_GROUP_STUDENTS = "/groups/students";     // GET (with query: ?groupId=...&branchId=...&madrassaId=...)
export const ADD_STUDENTS_TO_GROUP = "/groups/add-students";     // POST
export const REMOVE_STUDENT_FROM_GROUP = "/groups/remove-student"; // POST
export const GET_UNGROUPED_STUDENTS  = "/groups/ungrouped-students"

