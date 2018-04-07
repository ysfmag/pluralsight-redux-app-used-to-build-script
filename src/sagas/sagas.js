/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
import { takeLatest, fork, put, call, all, select, take } from "redux-saga/effects";
import * as authorActions from "../actions/authorActions";
import * as courseActions from "../actions/courseActions";
import * as ajaxActions from "../actions/ajaxStatusActions";
import * as actionTypes from '../actions/actionTypes';
import CourseApi from "../api/mockCourseApi";
import AuthorApi from "../api/mockAuthorApi";

export function* loadAuthors() {
  try {
    yield put(ajaxActions.beginAjaxCall()); // dispatch an action
    const authors = yield call(AuthorApi.getAllAuthors); // call func. Can optionally pass additional params (as 2nd param) to pass to args to the func
    yield put(authorActions.loadAuthorsSuccess(authors)); // dispatch an action
  } catch (error) {
    yield put(ajaxActions.ajaxCallError(error)); // dispatch an action
  }
}

export function* loadCourses() {
  try {
    yield put(ajaxActions.beginAjaxCall()); // dispatch an action
    const courses = yield call(CourseApi.getAllCourses); // call func. Can optionally pass additional params (as 2nd param) to pass to args to the func
    yield put(courseActions.loadCoursesSuccess(courses)); // dispatch an action
  } catch (error) {
    yield put(ajaxActions.ajaxCallError(error)); // dispatch an action
  }
}

export function* saveCourse(course) {
  // yield will suspend the saga until it comples.
  const savedCourse = yield call(CourseApi.saveCourse(course));
  // Put is an effect. Effects are just JS objects that contain instructions that are handled by middleware.
  // Sagas are paused while the middlware is processing a yielded effect.
  const action = course.id
    ? courseActions.createCourseSuccess(savedCourse)
    : courseActions.updateCourseSuccess(savedCourse);
  yield put(action);
}

// Spawn a new loadCourse task on each LOAD_COURSE
export function* watchLoadCourses() {
  yield take(actionTypes.LOAD_COURSES, loadCourses);
}

// Spawn a new saveCourse task on each SAVE_COURSE
export function* watchSaveCourse() {
  yield take(actionTypes.SAVE_COURSE, saveCourse);
}

function* watchAndLog() {
  while (true) {
    let action = yield take("*");
    let state = yield select();

    console.log("action", action);
    console.log("state after", state);
  }
}

export default function* rootSaga() {
  // Start all sagas in paralell.
  yield all([
    fork(loadCourses),
    fork(loadAuthors),
    fork(watchSaveCourse),
    fork(watchAndLog)
  ]);
}
