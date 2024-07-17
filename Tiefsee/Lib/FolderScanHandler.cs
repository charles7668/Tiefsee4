using System.Collections;
using System.Collections.Concurrent;
using System.Text.Json;

namespace Tiefsee.Lib {
    internal class FolderScanHandler {
        private readonly ConcurrentDictionary<string, List<string>> _folderFileDict = new();
        private readonly ConcurrentQueue<string> _folderScanningQueue = new();
        private Task _folderScanningTask = Task.CompletedTask;
        private CancellationTokenSource _folderScanningTokenSource = new();

        internal void EnqueueTaskData(string data) {
            _folderScanningQueue.Enqueue(data);
        }

        internal string GetCurrentResult() {
            if (_folderScanningTask.IsCompleted || _folderScanningTokenSource.IsCancellationRequested)
                _folderFileDict.TryAdd("completed", []);

            string result;
            lock (_folderFileDict) {
                result = JsonSerializer.Serialize(_folderFileDict);
                _folderFileDict.Clear();
            }

            return result;
        }

        /// <summary>
        /// stop scanning task and clear queue data
        /// </summary>
        internal void Reset() {
            _folderScanningTokenSource.Cancel();
            _folderFileDict.Clear();
        }

        /// <summary>
        /// start scanning task
        /// </summary>
        /// <param name="taskDataParseMethod">parse method</param>
        /// <param name="getFileListMethod">
        /// A method that retrieves a list of files. It takes the following parameters: <br />
        /// - folderPath as <see cref="string" /> : The path of the folder to scan. <br />
        /// - supportedExt as <see cref="string" />[] : An array of supported file extensions. <br />
        /// - token as <see cref="CancellationToken" /> : A cancellation token to support task cancellation. <br />
        /// - takeCount as <see cref="int" /> : The maximum number of files to retrieve. <br />
        /// - excludeFile as <see cref="string" /> : A file to exclude from the results. <br />
        /// This method returns a list of file paths as <see cref="IEnumerable" /> <see cref="string" />.
        /// </param>
        /// <param name="supportedExt">support extension list as <see cref="string" />[] </param>
        internal void StartTask(Func<string, string[]> taskDataParseMethod,
            Func<string, string[], CancellationToken, int, string, IEnumerable<string>> getFileListMethod,
            string[] supportedExt) {
            _folderScanningTokenSource = new CancellationTokenSource();
            var token = _folderScanningTokenSource.Token;
            _folderScanningTask = Task.Run(() => {
                while (!_folderScanningQueue.IsEmpty && !token.IsCancellationRequested) {
                    _folderScanningQueue.TryDequeue(out var queueData);
                    if (queueData == null)
                        continue;
                    var data = taskDataParseMethod(queueData);
                    var fileList = getFileListMethod(data[0], supportedExt, token, 3, data[1]);
                    _folderFileDict.TryAdd(data[0], fileList.ToList());
                }
            }, token);
        }
    }
}
